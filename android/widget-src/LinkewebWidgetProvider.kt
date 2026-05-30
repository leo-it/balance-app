package com.leoit.balanceapp.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.leoit.balanceapp.R
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

/**
 * Widget 2x2 — requiere WIDGET_API_KEY y WIDGET_API_URL en BuildConfig o SharedPreferences.
 * Copiar a android/app/src/main/java/... tras `npx cap add android`.
 */
class LinkewebWidgetProvider : AppWidgetProvider() {

  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    for (id in ids) {
      updateWidget(context, manager, id)
    }
  }

  private fun updateWidget(context: Context, manager: AppWidgetManager, id: Int) {
    val views = RemoteViews(context.packageName, R.layout.widget_linkeweb)
    val prefs = context.getSharedPreferences("linkeweb_widget", Context.MODE_PRIVATE)
    val apiUrl = prefs.getString("api_url", "https://your-app.vercel.app/api/widget/summary")
    val apiKey = prefs.getString("api_key", "")
    val userId = prefs.getString("user_id", "dev-user")

    Thread {
      try {
        val conn = URL("$apiUrl?userId=$userId").openConnection() as HttpURLConnection
        conn.requestMethod = "GET"
        if (apiKey.isNotEmpty()) conn.setRequestProperty("Authorization", "Bearer $apiKey")
        val body = conn.inputStream.bufferedReader().readText()
        val json = JSONObject(body)
        views.setTextViewText(R.id.widget_daily, "$${json.getInt("dailyAvailable")}")
        views.setTextViewText(R.id.widget_remaining, "Restante: $${json.getInt("monthRemaining")}")
        manager.updateAppWidget(id, views)
      } catch (_: Exception) {
        views.setTextViewText(R.id.widget_daily, "—")
        views.setTextViewText(R.id.widget_remaining, "Sin conexión")
        manager.updateAppWidget(id, views)
      }
    }.start()
  }
}
