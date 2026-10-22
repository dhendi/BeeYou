import os
import wave
import miniaudio

audio_dirs = [
    'public/assets/audio/core',
    'dist/assets/audio/core',
    'android/app/src/main/assets/public/assets/audio/core',
    'ios/App/App/public/assets/audio/core',
]

base_dir = 'public/assets/audio/core'
mp3_files = [f for f in os.listdir(base_dir) if f.endswith('.mp3')]

print(f"Found {len(mp3_files)} MP3 files in {base_dir}")

converted_count = 0
for mp3_name in mp3_files:
    wav_name = mp3_name[:-4] + '.wav'
    mp3_path = os.path.join(base_dir, mp3_name)
    
    try:
        decoded = miniaudio.decode_file(mp3_path, nchannels=1, sample_rate=24000)
        
        # Write wav to all target directories
        for target_dir in audio_dirs:
            if os.path.exists(target_dir):
                target_wav = os.path.join(target_dir, wav_name)
                with wave.open(target_wav, 'wb') as wav_out:
                    wav_out.setnchannels(1)
                    wav_out.setsampwidth(2)
                    wav_out.setframerate(24000)
                    wav_out.writeframes(decoded.samples)
        
        converted_count += 1
    except Exception as e:
        print(f"Error converting {mp3_name}: {e}")

print(f"Successfully converted {converted_count} MP3 files to 24kHz 16-bit Mono PCM WAV across all platforms!")
