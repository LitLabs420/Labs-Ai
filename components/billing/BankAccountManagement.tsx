'use client';

import React, { useState, useEffect } from 'react';
import { BankAccountRecord, countryInfo } from '@/lib/bank-accounts';

interface BankAccount extends BankAccountRecord {
  id: string;
}

export function BankAccountManagement() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'individual',
    businessTaxId: '',
    accountHolder: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    iban: '',
    bic: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking',
    bankName: '',
    accountHolderType: 'individual' as const,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      setLoading(true);
      const response = await fetch('/api/bank-accounts');
      if (!response.ok) throw new Error('Failed to load accounts');
      const data = await response.json();
      setAccounts(data.accounts || []);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load accounts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create account');
      }

      await loadAccounts();
      setShowForm(false);
      setFormData({
        businessName: '',
        businessType: 'individual',
        businessTaxId: '',
        accountHolder: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        iban: '',
        bic: '',
        routingNumber: '',
        accountNumber: '',
        accountType: 'checking',
        bankName: '',
        accountHolderType: 'individual',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleCountryChange(country: string) {
    setSelectedCountry(country);
    setFormData({
      ...formData,
      country,
      state: '',
      iban: '',
      bic: '',
      routingNumber: '',
      accountNumber: '',
    });
  }

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleDelete(accountId: string) {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    try {
      const response = await fetch(`/api/bank-accounts/${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete account');
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  }

  const isIbanCountry = ['GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'CH'].includes(selectedCountry);
  const isUSCanada = ['US', 'CA'].includes(selectedCountry);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bank Accounts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Bank Account'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold mb-2">Add Bank Account</h3>
          <p className="text-sm text-gray-400 mb-6">Add a bank account for receiving payouts</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Business Name"
                  value={formData.businessName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('businessName', e.target.value)
                  }
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={formData.businessType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleInputChange('businessType', e.target.value)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Business Type"
                >
                  <option value="individual">Individual</option>
                  <option value="sole_proprietor">Sole Proprietor</option>
                  <option value="partnership">Partnership</option>
                  <option value="corporation">Corporation</option>
                  <option value="llc">LLC</option>
                  <option value="non_profit">Non-Profit</option>
                </select>
              </div>
              {formData.businessType !== 'individual' && (
                <input
                  type="text"
                  placeholder="Tax ID / EIN"
                  value={formData.businessTaxId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('businessTaxId', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Account Holder */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Account Holder</h3>
              <input
                type="text"
                placeholder="Account Holder Name"
                value={formData.accountHolder}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('accountHolder', e.target.value)
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.accountHolderType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleInputChange('accountHolderType', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Account Holder Type"
              >
                <option value="individual">Individual</option>
                <option value="business">Business</option>
              </select>
            </div>

            {/* Country Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Country & Address</h3>
              <select
                value={selectedCountry}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleCountryChange(e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                title="Country"
              >
                {Object.entries(countryInfo).map(([code, info]) => (
                  <option key={code} value={code}>
                    {code} - {info.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Address Fields */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Address Line 1"
                value={formData.addressLine1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('addressLine1', e.target.value)
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={formData.addressLine2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('addressLine2', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('city', e.target.value)
                  }
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {['US', 'CA', 'AU'].includes(selectedCountry) && (
                  <input
                    type="text"
                    placeholder="State/Province"
                    value={formData.state}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('state', e.target.value)
                    }
                    required
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
              <input
                type="text"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('postalCode', e.target.value)
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bank Details - IBAN Countries */}
            {isIbanCountry && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Bank Details (IBAN)</h3>
                <input
                  type="text"
                  placeholder="IBAN"
                  value={formData.iban}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('iban', e.target.value.toUpperCase())
                  }
                  maxLength={34}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="BIC/SWIFT Code"
                  value={formData.bic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('bic', e.target.value.toUpperCase())
                  }
                  maxLength={11}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={formData.bankName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('bankName', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Bank Details - US/Canada */}
            {isUSCanada && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Bank Details</h3>
                <input
                  type="text"
                  placeholder="Routing Number"
                  value={formData.routingNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))
                  }
                  maxLength={9}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={formData.accountNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 17))
                  }
                  maxLength={17}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={formData.accountType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleInputChange('accountType', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  title="Account Type"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="money_market">Money Market</option>
                </select>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Bank Account'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bank Accounts List */}
      <div className="space-y-4">
        {loading && !accounts.length && <div>Loading accounts...</div>}

        {accounts.length === 0 && !loading && !showForm && (
          <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm p-6">
            <p className="text-gray-600 text-center">
              No bank accounts yet. Add one to start receiving payouts.
            </p>
          </div>
        )}

        {accounts.map((account) => (
          <div
            key={account.id}
            className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{account.businessName}</h3>
                <p className="text-sm text-gray-400">
                  {account.country} • {account.verified ? '✓ Verified' : 'Pending Verification'}
                </p>
              </div>
              <button
                onClick={() => handleDelete(account.id)}
                className="px-3 py-2 border border-gray-300 hover:bg-red-50 hover:border-red-300 text-red-600 rounded-lg transition-colors text-sm"
              >
                Delete
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Account Holder</p>
                <p className="font-medium">{account.accountHolderName}</p>
              </div>
              <div>
                <p className="text-gray-600">Account Type</p>
                <p className="font-medium">{account.accountType || account.businessType}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Address</p>
                <p className="font-medium">
                  {account.addressLine1}, {account.city}, {account.postalCode}
                </p>
              </div>
              {account.iban && (
                <div className="col-span-2">
                  <p className="text-gray-600">IBAN</p>
                  <p className="font-medium font-mono">{account.iban}</p>
                </div>
              )}
              {account.routingNumber && (
                <div>
                  <p className="text-gray-600">Routing #</p>
                  <p className="font-medium font-mono">***{account.routingNumber.slice(-4)}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
