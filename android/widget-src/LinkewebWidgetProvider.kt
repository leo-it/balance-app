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
 * Widget 2x2 — defaults: restante gastable, gastos del mes, ahorro USD.
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
        views.setTextViewText(
          R.id.widget_spendable,
          formatArs(json.optDouble("spendableRemaining", 0.0)),
        )
        views.setTextViewText(
          R.id.widget_spent,
          "Gastos: ${formatArs(json.optDouble("totalSpent", 0.0))}",
        )
        views.setTextViewText(
          R.id.widget_savings_usd,
          "Ahorro USD: US$${formatUsd(json.optDouble("savingsUsd", 0.0))}",
        )
        manager.updateAppWidget(id, views)
      } catch (_: Exception) {
        views.setTextViewText(R.id.widget_spendable, "—")
        views.setTextViewText(R.id.widget_spent, "Sin conexión")
        views.setTextViewText(R.id.widget_savings_usd, "")
        manager.updateAppWidget(id, views)
      }
    }.start()
  }

  private fun formatArs(value: Double): String {
    return "$${"%,.0f".format(value)}"
  }

  private fun formatUsd(value: Double): String {
    return "%,.2f".format(value)
  }
}
