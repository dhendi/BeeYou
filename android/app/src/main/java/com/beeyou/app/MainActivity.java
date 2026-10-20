package com.beeyou.app;

import android.media.AudioManager;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Ensure AAC speech routes through STREAM_MUSIC and volume keys adjust media volume
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
    }
}
