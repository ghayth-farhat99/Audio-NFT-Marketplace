from flask import Flask, request, jsonify , send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS , cross_origin
import random
import librosa
import numpy as np
import tensorflow as tf
import os
import requests
import time
import argparse
from pathlib import Path
import soundfile as sf
import torch

from deep_speaker.audio import read_mfcc
from deep_speaker.batcher import sample_from_mfcc
from deep_speaker.constants import SAMPLE_RATE, NUM_FRAMES
from deep_speaker.conv_models import DeepSpeakerModel
from deep_speaker.test import batch_cosine_similarity

from encoder import inference as encoder
from encoder.params_model import model_embedding_size as speaker_embedding_size
from synthesizer.inference import Synthesizer
from utils.argutils import print_args
from utils.default_models import ensure_default_models
from vocoder import inference as vocoder


app = Flask(__name__)
app.debug = True

CORS(app)


# Define the model here.
model = DeepSpeakerModel(pcm_input=True)
# Load the checkpoint. https://drive.google.com/file/d/1F9NvdrarWZNktdX9KlRYWWHDwRkip_aP.
# Also available here: https://share.weiyun.com/V2suEUVh (Chinese users).
model.m.load_weights('ResCNN_triplet_training_checkpoint_265.h5', by_name=True)


API_KEY = '06c97688004656d99d85'
API_SECRET = '134dd2ad98c708343629cd70ad576e4d53b4af6f87cec67658d6a3a115cb98f6'

headers = {
    'pinata_api_key': API_KEY,
    'pinata_secret_api_key': API_SECRET
}
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'audio' not in request.files:
        return 'No audio file provided', 400

    audio_files = request.files.getlist('audio')  # get list of audio files
    audio_names = request.form.getlist('name')  # get list of audio file names

    if not all(audio_names):
        return 'No name provided', 400  # return an error if any name is missing

    # Save the audio files to the "audio" folder
    audio_folder = os.path.join(os.getcwd(), 'audio')
    if not os.path.exists(audio_folder):
        os.makedirs(audio_folder)

    for audio_file, audio_name in zip(audio_files, audio_names):
        audio_file.save(os.path.join(audio_folder, audio_name))
        time.sleep(5)
        download_audio(audio_name)

    # Return a success message
    return {'message': 'Audio files uploaded and downloaded successfully'}


def download_audio(name):
    with open("audio/" + name, 'r') as f:
        audio_url = f.read().strip()

    response = requests.get(audio_url,headers=headers)
    if response.status_code == 200:
        with open("marketplace/" + name +'.wav', 'wb') as f:
            f.write(response.content)
    else:
        response.raise_for_status()
    time.sleep(2)



folder_path = "marketplace/"

# define an endpoint for receiving input and returning output

@app.route("/predict", methods=["POST"])
def predict():
    if(not(request.files["file"])):
        output_data = False
    # get the input parameter from the request
    input_data = request.files["file"]
    samples = [input_data]
    output_data = True
    # Reproducible results.
    np.random.seed(123)
    random.seed(123)
    for path, dirs, files in os.walk(folder_path):
        for filename in files:
            samples.append(folder_path + filename)
    pcm = [librosa.load(x, sr=SAMPLE_RATE, mono=True)[0] for x in samples]

        # Crop samples in the center, to fit the smaller audio samples
    num_samples = min([len(x) for x in pcm])
    pcm = tf.convert_to_tensor(np.stack([x[(len(x) - num_samples) // 2:][:num_samples] for x in pcm]))
        # Call the model to get the embeddings of shape (1, 512) for each file.
    predict = model.m.predict(pcm)
    speaker_similarity = batch_cosine_similarity(predict[0:1], predict[1:])
    for i in range(len(speaker_similarity)):
        if(speaker_similarity[i] > 0.7):
            output_data = False
            
    return {"output": output_data , "voice name":filename }


@app.route("/generate-audio", methods=["POST"])
def generate():
    if 'audioUrl' not in request.files or 'text' not in request.form:
        return 'Error: Please upload an audio file and enter text.'

    audio_file = request.files['audioUrl']
    audio_file.save("input.wav")

    text = request.form['text']

    enc_model_fpath = "saved_models/default/encoder.pt"
    syn_model_fpath = "saved_models/default/synthesizer.pt"
    voc_model_fpath = "saved_models/default/vocoder.pt"
    cpu = False  # Set to True if you want to force CPU processing
    no_sound = False
    seed = None  # Set a specific seed value if desired

    # Hide GPUs from PyTorch to force CPU processing if necessary
    if cpu:
        os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

    # Load the models
    print("Preparing the encoder, the synthesizer, and the vocoder...")
    ensure_default_models(Path("saved_models"))
    encoder.load_model(enc_model_fpath)
    synthesizer = Synthesizer(syn_model_fpath)
    vocoder.load_model(voc_model_fpath)

    # Preprocess and load the input audio file
    in_fpath = "input.wav"
    original_wav, sampling_rate = librosa.load(str(in_fpath))
    preprocessed_wav = encoder.preprocess_wav(original_wav, sampling_rate)
    print("Loaded file successfully")

    # Create the embedding
    embed = encoder.embed_utterance(preprocessed_wav)
    print("Created the embedding")

    # Set the random seed if specified
    if seed is not None:
        torch.manual_seed(seed)
        synthesizer = Synthesizer(syn_model_fpath)

    # Synthesize the mel spectrogram
    texts = [text]
    embeds = [embed]
    specs = synthesizer.synthesize_spectrograms(texts, embeds)
    spec = specs[0]
    print("Created the mel spectrogram")

    # Generate the waveform
    print("Synthesizing the waveform:")

    # Reset the torch seed and reload the vocoder if seed is specified
    if seed is not None:
        torch.manual_seed(seed)
        vocoder.load_model(voc_model_fpath)

    generated_wav = vocoder.infer_waveform(spec)

    # Post-generation steps
    generated_wav = np.pad(generated_wav, (0, synthesizer.sample_rate), mode="constant")
    generated_wav = encoder.preprocess_wav(generated_wav)

    # Save the generated audio on disk
    filename = "output.wav"
    sf.write(filename, generated_wav.astype(np.float32), synthesizer.sample_rate)
    print(generated_wav.dtype)

    return send_file(filename, as_attachment=True)

