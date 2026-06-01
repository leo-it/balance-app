package com.leoit.balanceapp;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.leoit.balanceapp.widget.BalanceAppWidgetProvider;
import com.leoit.balanceapp.widget.WidgetConfigStore;

@CapacitorPlugin(name = "WidgetConfig")
public class WidgetConfigPlugin extends Plugin {

  @PluginMethod
  public void configure(PluginCall call) {
    String userId = call.getString("userId");
    if (userId == null || userId.isEmpty()) {
      call.reject("userId is required");
      return;
    }

    String apiBase = call.getString("apiBase");
    if (apiBase == null || apiBase.isEmpty()) {
      apiBase = BuildConfig.WIDGET_API_BASE;
    }

    WidgetConfigStore.INSTANCE.save(getContext(), apiBase, userId);
    BalanceAppWidgetProvider.Companion.refreshAll(getContext());
    call.resolve();
  }
}
