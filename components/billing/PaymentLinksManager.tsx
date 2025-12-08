'use client';

import { useState, useEffect } from 'react';
import { Copy, Link as LinkIcon, Eye, EyeOff, Trash2, Plus } from 'lucide-react';

interface PaymentLink {
  id: string;
  title: string;
  description?: string;
  type: 'product' | 'subscription' | 'donation';
  amount: number;
  currency: string;
  url: string;
  active: boolean;
  createdAt: Date;
  viewCount: number;
  conversionCount: number;
}

export function PaymentLinksManager() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'product',
    amount: 0,
    currency: 'usd',
    billingInterval: 'month',
  });

  // Load payment links on mount
  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links);
      }
    } catch (error) {
      console.error('Error loading payment links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/payment-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newLink = await response.json();
        setLinks([...links, newLink]);
        setFormData({
          title: '',
          description: '',
          type: 'product',
          amount: 0,
          currency: 'usd',
          billingInterval: 'month',
        });
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      alert('Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url: string, linkId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (linkId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/payment-links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });

      if (response.ok) {
        setLinks(
          links.map((link) =>
            link.id === linkId ? { ...link, active: !active } : link
          )
        );
      }
    } catch (error) {
      console.error('Error toggling link status:', error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this payment link?')) return;

    try {
      const response = await fetch(`/api/payment-links/${linkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLinks(links.filter((link) => link.id !== linkId));
      }
    } catch (error) {
      console.error('Error deleting payment link:', error);
    }
  };

  const typeLabels = {
    product: 'One-Time Purchase',
    subscription: 'Recurring Subscription',
    donation: 'Donation',
  };

  return (
    <div className='space-y-6'>
      {/* HEADER */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-white'>💳 Payment Links</h2>
          <p className='text-white/60 text-sm mt-1'>Create shareable checkout pages in seconds</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className='px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold flex items-center gap-2 transition'
        >
          <Plus size={18} />
          Create Link
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <div className='rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6'>
          <h3 className='text-lg font-bold text-white mb-4'>New Payment Link</h3>
          <form onSubmit={handleCreateLink} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Title */}
              <input
                type='text'
                placeholder='Link Title (e.g., "Premium Template Pack")'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className='px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-pink-500 transition'
                required
              />

              {/* Type */}
              <select
                aria-label='Payment link type'
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className='px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500 transition'
              >
                <option value='product'>One-Time Purchase</option>
                <option value='subscription'>Recurring Subscription</option>
                <option value='donation'>Donation</option>
              </select>
            </div>

            <textarea
              placeholder='Description (optional)'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className='w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-pink-500 transition resize-none'
              rows={2}
            />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Amount */}
              <input
                type='number'
                placeholder='Price'
                step='0.01'
                min='0.50'
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className='px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-pink-500 transition'
                required
              />

              {/* Currency */}
              <select
                aria-label='Currency'
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className='px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500 transition'
              >
                <option value='usd'>USD</option>
                <option value='eur'>EUR</option>
                <option value='gbp'>GBP</option>
                <option value='cad'>CAD</option>
              </select>

              {/* Billing Interval (for subscriptions) */}
              {(formData.type as string) === 'subscription' && (
                <select
                  aria-label='Billing interval'
                  value={formData.billingInterval}
                  onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value as any })}
                  className='px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500 transition'
                >
                  <option value='month'>Monthly</option>
                  <option value='year'>Yearly</option>
                </select>
              )}
            </div>

            <div className='flex gap-3'>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50 transition'
              >
                {loading ? 'Creating...' : 'Create Payment Link'}
              </button>
              <button
                type='button'
                onClick={() => setShowForm(false)}
                className='flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PAYMENT LINKS LIST */}
      {loading && links.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-white/60'>Loading payment links...</div>
        </div>
      ) : links.length === 0 ? (
        <div className='text-center py-12 rounded-xl border border-white/10 bg-white/5'>
          <LinkIcon size={32} className='mx-auto mb-3 text-white/40' />
          <p className='text-white/60'>No payment links yet</p>
          <p className='text-white/40 text-sm mt-1'>Create your first payment link to get started</p>
        </div>
      ) : (
        <div className='grid gap-4'>
          {links.map((link) => (
            <div
              key={link.id}
              className='rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-4 hover:border-white/20 transition'
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-lg font-bold text-white'>{link.title}</h3>
                    <span className='px-2 py-1 rounded-full text-xs font-medium bg-pink-500/20 text-pink-300'>
                      {typeLabels[link.type]}
                    </span>
                  </div>
                  {link.description && (
                    <p className='text-white/60 text-sm mt-1'>{link.description}</p>
                  )}
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-pink-400'>
                    {link.currency.toUpperCase()} {(link.amount / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* STATS */}
              <div className='grid grid-cols-2 gap-2 mb-4'>
                <div className='bg-white/5 rounded-lg p-2'>
                  <p className='text-xs text-white/60'>Views</p>
                  <p className='text-lg font-bold text-white'>{link.viewCount}</p>
                </div>
                <div className='bg-white/5 rounded-lg p-2'>
                  <p className='text-xs text-white/60'>Conversions</p>
                  <p className='text-lg font-bold text-white'>{link.conversionCount}</p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handleCopyLink(link.url, link.id)}
                  className='flex-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium flex items-center justify-center gap-2 transition'
                >
                  <Copy size={16} />
                  {copiedId === link.id ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium flex items-center justify-center gap-2 transition'
                >
                  <LinkIcon size={16} />
                  View
                </a>
                <button
                  onClick={() => handleToggleActive(link.id, link.active)}
                  className={`px-3 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition ${
                    link.active
                      ? 'bg-green-500/20 hover:bg-green-500/30'
                      : 'bg-red-500/20 hover:bg-red-500/30'
                  }`}
                >
                  {link.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  {link.active ? 'Active' : 'Inactive'}
                </button>
                <button
                  aria-label='Delete payment link'
                  onClick={() => handleDeleteLink(link.id)}
                  className='px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-medium flex items-center justify-center transition'
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
