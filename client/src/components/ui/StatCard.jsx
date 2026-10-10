/**
 * StatCard Component
 * For displaying statistics on dashboards
 */

import { Card } from './Card';

export const StatCard = ({ title, value, icon, color = 'primary', trend }) => {
  const colors = {
    primary: 'var(--color-primary-600)',
    success: 'var(--color-success-600)',
    warning: 'var(--color-warning-600)',
    error: 'var(--color-error-600)',
    gray: 'var(--color-gray-600)',
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const contentStyles = {
    flex: 1,
  };

  const titleStyles = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--color-gray-600)',
    marginBottom: 'var(--spacing-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  };

  const valueStyles = {
    fontSize: '2rem',
    fontWeight: '700',
    color: colors[color],
    lineHeight: '1',
  };

  const iconStyles = {
    fontSize: '2rem',
    color: colors[color],
    opacity: '0.2',
  };

  const trendStyles = {
    fontSize: '0.75rem',
    marginTop: 'var(--spacing-2)',
    color: trend?.direction === 'up' ? 'var(--color-success-600)' : 'var(--color-error-600)',
  };

  return (
    <Card padding={true}>
      <div style={containerStyles}>
        <div style={contentStyles}>
          <div style={titleStyles}>{title}</div>
          <div style={valueStyles}>{value}</div>
          {trend && (
            <div style={trendStyles}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>
        {icon && <div style={iconStyles}>{icon}</div>}
      </div>
    </Card>
  );
};
