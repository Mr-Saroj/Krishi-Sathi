// src/utils/middlecontentUtils.js
// Neumorphic version. Requires the neu-* utilities from index.css.
import React from 'react';

const h = React.createElement;

// Skeleton
export const Skeleton = ({ className = '' }) =>
  h('span', {
    className: `inline-block animate-pulse rounded bg-outline-variant/40 ${className}`,
  });

// Stat Card
// NOTE: colorClass should now be a TEXT colour only (e.g. "text-emerald-600"),
// because the icon well is an inset neumorphic surface.
export const StatCard = ({ label, value, icon, colorClass, sub }) =>
  h(
    'div',
    {
      className:
        'neu-raised group rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 sm:p-5',
    },
    h(
      'div',
      { className: 'mb-4 flex items-start justify-between' },
      h(
        'div',
        { className: `neu-inset flex rounded-xl p-3 ${colorClass}` },
        h('span', { className: 'material-symbols-outlined text-2xl' }, icon)
      ),
      h(
        'span',
        {
          className:
            'neu-inset-sm rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-on-surface-variant',
        },
        sub
      )
    ),
    h('p', { className: 'text-sm font-medium text-on-surface-variant' }, label),
    h(
      'p',
      {
        className:
          'mt-1 break-words text-2xl font-extrabold tracking-tight text-primary',
      },
      value
    )
  );

// Sales Chart
export const SalesChart = ({ data = [] }) => {
  const maxSales = Math.max(...data.map((item) => item.sales), 1);

  return h(
    'section',
    { className: 'neu-raised rounded-2xl p-4 sm:p-6' },
    h(
      'div',
      { className: 'mb-6 flex flex-wrap items-center justify-between gap-3' },
      h(
        'div',
        null,
        h('h2', { className: 'font-bold text-primary sm:text-lg' }, 'Sales Overview'),
        h(
          'p',
          { className: 'mt-1 text-xs text-on-surface-variant' },
          'Daily sales performance'
        )
      ),
      h(
        'span',
        {
          className:
            'neu-inset-sm rounded-lg px-3 py-2 text-xs font-semibold text-secondary',
        },
        'Last 7 days'
      )
    ),
    h(
      'div',
      { className: 'flex h-56 items-end gap-2 sm:h-72 sm:gap-5' },
      data.map((item) =>
        h(
          'div',
          {
            key: item.day,
            className:
              'flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2',
          },
          h(
            'span',
            { className: 'hidden text-[10px] text-on-surface-variant sm:block' },
            `₹${(item.sales / 1000).toFixed(1)}k`
          ),
          // Inset track with a green bar inside
          h(
            'div',
            {
              className:
                'neu-inset-sm flex h-full w-full max-w-12 items-end rounded-full p-1',
            },
            h('div', {
              title: `${item.day}: ₹${item.sales.toLocaleString('en-IN')}`,
              className:
                'w-full rounded-full bg-secondary shadow-[2px_2px_5px_var(--neu-dark)] transition-all duration-300 hover:bg-primary-container',
              style: {
                height: `${Math.max((item.sales / maxSales) * 100, 4)}%`,
              },
            })
          ),
          h(
            'span',
            {
              className:
                'text-[10px] font-medium text-on-surface-variant sm:text-xs',
            },
            item.day
          )
        )
      )
    )
  );
};

// Order status styles (text colour only; the chip itself is inset)
const statusClasses = {
  PLACED: 'text-blue-700',
  CONFIRMED: 'text-violet-700',
  SHIPPED: 'text-amber-700',
  DELIVERED: 'text-secondary',
  CANCELLED: 'text-error',
};

// Recent Orders
export const RecentOrders = ({ orders = [] }) =>
  h(
    'section',
    { className: 'neu-raised overflow-hidden rounded-2xl' },
    h(
      'div',
      {
        className:
          'flex items-center justify-between gap-3 border-b border-primary/10 px-4 py-4 sm:px-6',
      },
      h(
        'div',
        null,
        h('h2', { className: 'font-bold text-primary sm:text-lg' }, 'Recent Orders'),
        h(
          'p',
          { className: 'mt-1 text-xs text-on-surface-variant' },
          'Latest marketplace transactions'
        )
      ),
      h(
        'a',
        {
          href: '/admin-dashboard/orders',
          className:
            'neu-btn shrink-0 rounded-lg px-4 py-2 text-xs font-semibold text-secondary',
        },
        'View all'
      )
    ),
    h(
      'div',
      { className: 'overflow-x-auto' },
      h(
        'table',
        { className: 'w-full min-w-[700px] text-left text-sm' },
        h(
          'thead',
          { className: 'text-xs uppercase tracking-wide text-outline' },
          h(
            'tr',
            null,
            ...['Order ID', 'Farmer', 'Seller', 'Amount', 'Status', 'Date'].map(
              (heading) =>
                h('th', { key: heading, className: 'px-6 py-3 font-semibold' }, heading)
            )
          )
        ),
        h(
          'tbody',
          { className: 'divide-y divide-primary/10' },
          ...orders.map((order) =>
            h(
              'tr',
              { key: order.id, className: 'transition-colors hover:bg-primary/5' },
              h(
                'td',
                {
                  className:
                    'whitespace-nowrap px-6 py-4 font-semibold text-primary',
                },
                order.id
              ),
              h(
                'td',
                { className: 'whitespace-nowrap px-6 py-4 text-on-surface-variant' },
                order.farmer
              ),
              h(
                'td',
                { className: 'whitespace-nowrap px-6 py-4 text-on-surface-variant' },
                order.seller
              ),
              h(
                'td',
                {
                  className:
                    'whitespace-nowrap px-6 py-4 font-semibold text-on-surface',
                },
                `₹${order.amount.toLocaleString('en-IN')}`
              ),
              h(
                'td',
                { className: 'px-6 py-4' },
                h(
                  'span',
                  {
                    className: `neu-inset-sm whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${
                      statusClasses[order.status] || 'text-on-surface-variant'
                    }`,
                  },
                  order.status
                )
              ),
              h(
                'td',
                { className: 'whitespace-nowrap px-6 py-4 text-xs text-outline' },
                order.date
              )
            )
          ),
          orders.length === 0
            ? h(
                'tr',
                null,
                h(
                  'td',
                  {
                    colSpan: 6,
                    className: 'px-6 py-10 text-center text-outline',
                  },
                  'No recent orders found.'
                )
              )
            : null
        )
      )
    )
  );

// Alert icon colours (text only; the icon well is raised)
const alertClasses = {
  amber: 'text-amber-600',
  blue: 'text-blue-600',
  orange: 'text-orange-600',
};

// Dashboard Alerts
export const DashboardAlerts = ({ alerts = [] }) =>
  h(
    'section',
    { className: 'neu-raised rounded-2xl p-4 sm:p-6' },
    h(
      'div',
      { className: 'mb-5' },
      h('h2', { className: 'font-bold text-primary sm:text-lg' }, 'Marketplace Alerts'),
      h(
        'p',
        { className: 'mt-1 text-xs text-on-surface-variant' },
        'Items that may require admin attention'
      )
    ),
    h(
      'div',
      { className: 'grid grid-cols-1 gap-5 lg:grid-cols-3' },
      ...alerts.map((alert) =>
        h(
          'div',
          {
            key: alert.id,
            className: 'neu-inset flex flex-col rounded-xl p-4',
          },
          h(
            'div',
            { className: 'flex items-start gap-3' },
            h(
              'div',
              {
                className: `neu-raised-sm flex shrink-0 rounded-lg p-2 ${
                  alertClasses[alert.color] || 'text-on-surface-variant'
                }`,
              },
              h('span', { className: 'material-symbols-outlined' }, alert.icon)
            ),
            h(
              'div',
              { className: 'min-w-0' },
              h('h3', { className: 'text-sm font-bold text-primary' }, alert.title),
              h(
                'p',
                { className: 'mt-1 text-xs leading-5 text-on-surface-variant' },
                alert.description
              )
            )
          ),
          h(
            'a',
            {
              href: alert.link,
              className:
                'mt-4 w-fit text-xs font-semibold text-secondary hover:text-primary hover:underline',
            },
            `${alert.action} →`
          )
        )
      )
    )
  );