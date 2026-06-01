package com.leoit.balanceapp;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(WidgetConfigPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
