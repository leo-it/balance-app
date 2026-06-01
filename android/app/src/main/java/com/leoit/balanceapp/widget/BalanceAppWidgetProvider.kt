package com.leoit.balanceapp.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.leoit.balanceapp.BuildConfig
import com.leoit.balanceapp.MainActivity
import com.leoit.balanceapp.R
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

class BalanceAppWidgetProvider : AppWidgetProvider() {

  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    for (id in ids) {
      updateWidget(context, manager, id)
    }
  }

  override fun onEnabled(context: Context) {
    refreshAll(context)
  }

  companion object {
    @JvmStatic
    fun refreshAll(context: Context) {
      val manager = AppWidgetManager.getInstance(context)
      val component = ComponentName(context, BalanceAppWidgetProvider::class.java)
      val ids = manager.getAppWidgetIds(component)
      if (ids.isEmpty()) return
      val provider = BalanceAppWidgetProvider()
      provider.onUpdate(context, manager, ids)
    }
  }

  private fun updateWidget(context: Context, manager: AppWidgetManager, id: Int) {
    val views = RemoteViews(context.packageName, R.layout.widget_balance_app)
    attachOpenAppIntent(context, views)

    val userId = WidgetConfigStore.getUserId(context)
    if (userId.isNullOrBlank()) {
      views.setTextViewText(R.id.widget_spendable, "Abrí la app")
      views.setTextViewText(R.id.widget_spent, "Iniciá sesión una vez")
      views.setTextViewText(R.id.widget_savings_usd, "")
      manager.updateAppWidget(id, views)
      return
    }

    views.setTextViewText(R.id.widget_spendable, "…")
    views.setTextViewText(R.id.widget_spent, "Actualizando")
    views.setTextViewText(R.id.widget_savings_usd, "")
    manager.updateAppWidget(id, views)

    Thread {
      try {
        val data = fetchSummary(context, userId)
        views.setTextViewText(R.id.widget_spendable, formatArs(data.spendableRemaining))
        views.setTextViewText(R.id.widget_spent, "Gastos: ${formatArs(data.totalSpent)}")
        views.setTextViewText(
          R.id.widget_savings_usd,
          "Ahorro USD: US$${formatUsd(data.savingsUsd)}",
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

  private fun attachOpenAppIntent(context: Context, views: RemoteViews) {
    val intent = Intent(context, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }
    val pending = PendingIntent.getActivity(
      context,
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    views.setOnClickPendingIntent(R.id.widget_root, pending)
  }

  private data class SummaryData(
    val spendableRemaining: Double,
    val totalSpent: Double,
    val savingsUsd: Double,
  )

  private fun fetchSummary(context: Context, userId: String): SummaryData {
    val apiUrl = WidgetConfigStore.getApiUrl(context)
    val conn = URL("$apiUrl?userId=${encode(userId)}").openConnection() as HttpURLConnection
    conn.requestMethod = "GET"
    conn.connectTimeout = 10_000
    conn.readTimeout = 10_000
    val apiKey = BuildConfig.WIDGET_API_KEY
    if (apiKey.isNotEmpty()) {
      conn.setRequestProperty("Authorization", "Bearer $apiKey")
    }
    val body = conn.inputStream.bufferedReader().use { it.readText() }
    if (conn.responseCode >= 400) {
      throw IllegalStateException("HTTP ${conn.responseCode}")
    }
    val json = JSONObject(body)
    return SummaryData(
      spendableRemaining = json.optDouble("spendableRemaining", 0.0),
      totalSpent = json.optDouble("totalSpent", 0.0),
      savingsUsd = json.optDouble("savingsUsd", 0.0),
    )
  }

  private fun encode(value: String): String {
    return java.net.URLEncoder.encode(value, Charsets.UTF_8.name())
  }

  private fun formatArs(value: Double): String {
    return "$${"%,.0f".format(value)}"
  }

  private fun formatUsd(value: Double): String {
    return "%,.2f".format(value)
  }
}
