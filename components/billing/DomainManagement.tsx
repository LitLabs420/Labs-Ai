'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface Domain {
  id: string;
  domain: string;
  status: 'verified' | 'pending' | 'unverified' | 'failed';
  certificateStatus?: string;
  createdAt: string;
}

export function DomainManagement() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/stripe/domains');
      if (!response.ok) throw new Error('Failed to fetch domains');
      const data = await response.json();
      setDomains(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading domains');
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      setError('Domain is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/stripe/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add domain');
      }

      const data = await response.json();
      setDomains([...domains, data.data]);
      setNewDomain('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding domain');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'unverified':
        return <Loader className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Globe className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      verified: 'bg-green-900/20 text-green-400',
      pending: 'bg-yellow-900/20 text-yellow-400',
      unverified: 'bg-yellow-900/20 text-yellow-400',
      failed: 'bg-red-900/20 text-red-400',
    };

    return styles[status] || 'bg-gray-800 text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Custom Domains</h2>
          <p className="text-gray-400 text-sm">Manage your Stripe payment page domains</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Domain
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Add Your Domain</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Domain Name
              </label>
              <input
                type="text"
                placeholder="pay.example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <p className="text-gray-400 text-sm mt-1">
                You'll need to verify this domain with DNS records
              </p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white">Your domain will support:</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>✓ Checkout: pay.example.com/c/...</p>
                <p>✓ Payment Links: pay.example.com/b/...</p>
                <p>✓ Customer Portal: pay.example.com/p/...</p>
              </div>
            </div>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <p className="text-purple-400 text-sm">
                <strong>$10.00 USD / month</strong> - Renews automatically until cancelled
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddDomain}
                disabled={loading || !newDomain.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-white font-semibold transition"
              >
                {loading ? 'Adding...' : 'Add Domain'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewDomain('');
                  setError('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {domains.length === 0 && !showForm ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No custom domains yet</p>
          <p className="text-gray-500 text-sm">Add a domain to customize your payment pages</p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(domain.status)}
                  <div>
                    <p className="text-white font-semibold">{domain.domain}</p>
                    <p className="text-gray-400 text-sm">
                      Created {new Date(domain.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(domain.status)}`}>
                    {domain.status}
                  </span>
                  <button className="text-gray-400 hover:text-red-400 transition p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
