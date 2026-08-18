package com.louvaiaosenhor.app;

import android.app.Activity;
import android.os.Bundle;
import android.os.SystemClock;
import android.widget.Toast;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView webView;
    private long lastHomeBackPress;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setDefaultTextEncodingName("UTF-8");
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript("window.handleAndroidBack ? window.handleAndroidBack() : 'home'", result -> {
            if ("\"handled\"".equals(result)) return;
            long now = SystemClock.elapsedRealtime();
            if (now - lastHomeBackPress <= 2000) finish();
            else {
                lastHomeBackPress = now;
                Toast.makeText(MainActivity.this, "Aperte novamente para sair", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
