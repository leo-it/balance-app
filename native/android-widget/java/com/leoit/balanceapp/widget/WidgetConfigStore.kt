package com.leoit.balanceapp.widget

import android.content.Context
import com.leoit.balanceapp.BuildConfig

object WidgetConfigStore {
  private const val PREFS = "balance_app_widget"
  private const val KEY_API_BASE = "api_base"
  private const val KEY_USER_ID = "user_id"

  fun save(context: Context, apiBase: String, userId: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_API_BASE, apiBase.trimEnd('/'))
      .putString(KEY_USER_ID, userId)
      .apply()
  }

  fun getApiUrl(context: Context): String {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val base = prefs.getString(KEY_API_BASE, null) ?: BuildConfig.WIDGET_API_BASE
    return "${base.trimEnd('/')}/api/widget/summary"
  }

  fun getUserId(context: Context): String? {
    return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_USER_ID, null)
  }
}
