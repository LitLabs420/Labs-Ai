// Google Cloud Analytics Dashboard Component
'use client';

import { useEffect, useState } from 'react';

export default function GCPAnalyticsDashboard({ userId }) {
  const [metrics, setMetrics] = useState({
    revenue: {},
    automations: [],
    activity: [],
    topAutomations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(
        `/api/analytics/bigquery?metric=all&userId=${userId}`
      );
      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">💰 Revenue (Last 30 Days)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Revenue"
            value={`$${(metrics.revenue?.total_revenue || 0).toFixed(2)}`}
            color="green"
          />
          <MetricCard
            label="Total Payments"
            value={metrics.revenue?.total_payments || 0}
            color="blue"
          />
          <MetricCard
            label="Avg Payment"
            value={`$${(metrics.revenue?.avg_payment || 0).toFixed(2)}`}
            color="orange"
          />
          <MetricCard
            label="Days Active"
            value={metrics.revenue?.days_with_payments || 0}
            color="purple"
          />
        </div>
      </div>

      {/* Automation Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">🤖 Automation Usage</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Automation Type</th>
                <th className="px-4 py-2 text-right">Executions</th>
                <th className="px-4 py-2 text-right">Last Run</th>
              </tr>
            </thead>
            <tbody>
              {metrics.automations?.map((auto, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{auto.type}</td>
                  <td className="px-4 py-2 text-right">{auto.execution_count}</td>
                  <td className="px-4 py-2 text-right text-gray-600 text-xs">
                    {new Date(auto.last_execution).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📊 Activity (Last 7 Days)</h3>
        <div className="space-y-3">
          {metrics.activity?.map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="font-medium">{activity.event_type}</p>
                <p className="text-sm text-gray-600">
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
              <p className="text-lg font-bold text-blue-600">{activity.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          📍 <strong>Data Source:</strong> Google Cloud BigQuery
        </p>
        <p className="text-xs text-blue-800 mt-1">
          Project: studio-4627045237-a2fe9
        </p>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, color }) {
  const colorClasses = {
    green: 'bg-green-50 text-green-900',
    blue: 'bg-blue-50 text-blue-900',
    orange: 'bg-orange-50 text-orange-900',
    purple: 'bg-purple-50 text-purple-900'
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <p className="text-xs font-medium mb-1 opacity-75">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
