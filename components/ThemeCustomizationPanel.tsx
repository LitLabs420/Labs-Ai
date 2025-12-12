'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { themes } from '@/lib/design-system';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';

/**
 * Premium Theme Customization Panel
 * Allows users to view all available themes and customize colors
 */
export const ThemeCustomizationPanel: React.FC = () => {
  const { currentTheme, setTheme, customColors, setCustomColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (themeName: string) => {
    setTheme(themeName);
  };

  const handleColorChange = (colorKey: string, colorValue: string) => {
    setCustomColors?.({
      ...customColors,
      [colorKey]: colorValue,
    });
  };

  const themeEntries = Object.entries(themes);

  return (
    <>
      {/* Customization Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="hidden sm:inline-flex"
      >
        Customize Theme
      </Button>

      {/* Customization Panel Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Customize Theme"
        subtitle="Choose a theme or customize colors to your preference"
        maxWidth="lg"
      >
        <div className="space-y-8">
          {/* Theme Presets */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">
              Theme Presets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themeEntries.map(([themeName, theme]) => (
                <button
                  key={themeName}
                  onClick={() => handleThemeSelect(themeName)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-base text-left
                    ${
                      currentTheme.name === theme.name
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary'
                    }
                  `}
                >
                  <h4 className="font-semibold text-text mb-2">{theme.name}</h4>
                  <p className="text-sm text-text-secondary mb-3">
                    {theme.description}
                  </p>
                  <div className="flex space-x-2">
                    <div
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary Color"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent Color"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: theme.colors.success }}
                      title="Success Color"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          {currentTheme.name === 'Custom' && (
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">
                Custom Colors
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['primary', 'accent', 'success', 'warning', 'error'].map(
                  (colorKey) => (
                    <div key={colorKey}>
                      <label className="block text-sm font-medium text-text mb-2 capitalize">
                        {colorKey} Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={
                            (customColors && customColors[colorKey as keyof typeof customColors]) ||
                            currentTheme.colors[
                              colorKey as keyof typeof currentTheme.colors
                            ]
                          }
                          onChange={(e) =>
                            handleColorChange(colorKey, e.target.value)
                          }
                          className="w-12 h-12 rounded-lg cursor-pointer"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={
                              (customColors && customColors[colorKey as keyof typeof customColors]) ||
                              currentTheme.colors[
                                colorKey as keyof typeof currentTheme.colors
                              ]
                            }
                            onChange={(e) =>
                              handleColorChange(colorKey, e.target.value)
                            }
                            placeholder="#000000"
                            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">
              Preview
            </h3>
            <Card variant="glass" padding="lg">
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div>
                    <div
                      className="w-full h-24 rounded-lg border border-border mb-2"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                    />
                    <p className="text-xs font-medium text-text-secondary">
                      Primary
                    </p>
                  </div>
                  <div>
                    <div
                      className="w-full h-24 rounded-lg border border-border mb-2"
                      style={{ backgroundColor: currentTheme.colors.accent }}
                    />
                    <p className="text-xs font-medium text-text-secondary">
                      Accent
                    </p>
                  </div>
                  <div>
                    <div
                      className="w-full h-24 rounded-lg border border-border mb-2"
                      style={{ backgroundColor: currentTheme.colors.success }}
                    />
                    <p className="text-xs font-medium text-text-secondary">
                      Success
                    </p>
                  </div>
                  <div>
                    <div
                      className="w-full h-24 rounded-lg border border-border mb-2"
                      style={{ backgroundColor: currentTheme.colors.warning }}
                    />
                    <p className="text-xs font-medium text-text-secondary">
                      Warning
                    </p>
                  </div>
                  <div>
                    <div
                      className="w-full h-24 rounded-lg border border-border mb-2"
                      style={{ backgroundColor: currentTheme.colors.error }}
                    />
                    <p className="text-xs font-medium text-text-secondary">
                      Error
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Apply Theme
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ThemeCustomizationPanel;
