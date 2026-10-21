
import React from 'react';

const h = React.createElement;

// Skeleton
export const Skeleton = ({ className = '' }) =>
  h('span', {
    className: `inline-block animate-pulse rounded bg-slate-100 ${className}`,
  });

// Stat Card
export const StatCard = ({
  label,
  value,
  icon,
  colorClass,
  sub,
}) =>
  h(
    'div',
    {
      className:
        'group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-5',
    },
    h(
      'div',
      { className: 'mb-4 flex items-start justify-between' },
      h(
        'div',
        { className: `rounded-xl p-3 ${colorClass}` },
        h(
          'span',
          { className: 'material-symbols-outlined text-2xl' },
          icon
        )
      ),
      h(
        'span',
        {
          className:
            'rounded-full border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400',
        },
        sub
      )
    ),
    h(
      'p',
      { className: 'text-sm font-medium text-slate-500' },
      label
    ),
    h(
      'p',
      {
        className:
          'mt-1 break-words text-2xl font-extrabold tracking-tight text-slate-800',
      },
      value
    )
  );

// Sales Chart
export const SalesChart = ({ data = [] }) => {
  const maxSales = Math.max(
    ...data.map((item) => item.sales),
    1
  );

  return h(
    'section',
    {
      className:
        'rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6',
    },
    h(
      'div',
      {
        className:
          'mb-6 flex flex-wrap items-center justify-between gap-3',
      },
      h(
        'div',
        null,
        h(
          'h2',
          { className: 'font-bold text-slate-800 sm:text-lg' },
          'Sales Overview'
        ),
        h(
          'p',
          { className: 'mt-1 text-xs text-slate-400' },
          'Daily sales performance'
        )
      ),
      h(
        'span',
        {
          className:
            'rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700',
        },
        'Last 7 days'
      )
    ),
    h(
      'div',
      {
        className:
          'flex h-52 items-end gap-2 sm:h-64 sm:gap-5',
      },
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
            {
              className:
                'hidden text-[10px] text-slate-500 sm:block',
            },
            `₹${(item.sales / 1000).toFixed(1)}k`
          ),
          h(
            'div',
            {
              className:
                'flex h-full w-full items-end justify-center',
            },
            h('div', {
              title: `${item.day}: ₹${item.sales.toLocaleString('en-IN')}`,
              className:
                'w-full max-w-12 rounded-t-lg bg-emerald-500 transition-all duration-300 hover:bg-emerald-600',
              style: {
                height: `${Math.max(
                  (item.sales / maxSales) * 100,
                  3
                )}%`,
              },
            })
          ),
          h(
            'span',
            {
              className:
                'text-[10px] font-medium text-slate-400 sm:text-xs',
            },
            item.day
          )
        )
      )
    )
  );
};

// Order status styles
const statusClasses = {
  PLACED: 'bg-blue-50 text-blue-700',
  CONFIRMED: 'bg-violet-50 text-violet-700',
  SHIPPED: 'bg-amber-50 text-amber-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

// Recent Orders
export const RecentOrders = ({ orders = [] }) =>
  h(
    'section',
    {
      className:
        'overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm',
    },
    h(
      'div',
      {
        className:
          'flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6',
      },
      h(
        'div',
        null,
        h(
          'h2',
          { className: 'font-bold text-slate-800 sm:text-lg' },
          'Recent Orders'
        ),
        h(
          'p',
          { className: 'mt-1 text-xs text-slate-400' },
          'Latest marketplace transactions'
        )
      ),
      h(
        'a',
        {
          href: '/admin-dashboard/orders',
          className:
            'shrink-0 text-xs font-semibold text-emerald-700 hover:underline',
        },
        'View all'
      )
    ),
    h(
      'div',
      { className: 'overflow-x-auto' },
      h(
        'table',
        {
          className:
            'w-full min-w-[700px] text-left text-sm',
        },
        h(
          'thead',
          {
            className:
              'bg-slate-50 text-xs uppercase tracking-wide text-slate-400',
          },
          h(
            'tr',
            null,
            ...[
              'Order ID',
              'Farmer',
              'Seller',
              'Amount',
              'Status',
              'Date',
            ].map((heading) =>
              h(
                'th',
                {
                  key: heading,
                  className: 'px-6 py-3',
                },
                heading
              )
            )
          )
        ),
        h(
          'tbody',
          { className: 'divide-y divide-slate-100' },
          ...orders.map((order) =>
            h(
              'tr',
              {
                key: order.id,
                className: 'hover:bg-slate-50/70',
              },
              h(
                'td',
                {
                  className:
                    'whitespace-nowrap px-6 py-4 font-semibold text-slate-700',
                },
                order.id
              ),
              h(
                'td',
                {
                  className:
                    'whitespace-nowrap px-6 py-4 text-slate-600',
                },
                order.farmer
              ),
              h(
                'td',
                {
                  className:
                    'whitespace-nowrap px-6 py-4 text-slate-600',
                },
                order.seller
              ),
              h(
                'td',
                {
                  className:
                    'whitespace-nowrap px-6 py-4 font-semibold text-slate-700',
                },
                `₹${order.amount.toLocaleString('en-IN')}`
              ),
              h(
                'td',
                { className: 'px-6 py-4' },
                h(
                  'span',
                  {
                    className: `whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      statusClasses[order.status] ||
                      'bg-slate-100 text-slate-600'
                    }`,
                  },
                  order.status
                )
              ),
              h(
                'td',
                {
                  className:
                    'whitespace-nowrap px-6 py-4 text-xs text-slate-400',
                },
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
                    className:
                      'px-6 py-10 text-center text-slate-400',
                  },
                  'No recent orders found.'
                )
              )
            : null
        )
      )
    )
  );

// Alert colors
const alertClasses = {
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  orange: 'bg-orange-50 text-orange-600',
};

// Dashboard Alerts
export const DashboardAlerts = ({ alerts = [] }) =>
  h(
    'section',
    {
      className:
        'rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6',
    },
    h(
      'div',
      { className: 'mb-5' },
      h(
        'h2',
        { className: 'font-bold text-slate-800 sm:text-lg' },
        'Marketplace Alerts'
      ),
      h(
        'p',
        { className: 'mt-1 text-xs text-slate-400' },
        'Items that may require admin attention'
      )
    ),
    h(
      'div',
      {
        className:
          'grid grid-cols-1 gap-3 lg:grid-cols-3',
      },
      ...alerts.map((alert) =>
        h(
          'div',
          {
            key: alert.id,
            className:
              'flex flex-col rounded-xl border border-slate-100 p-4',
          },
          h(
            'div',
            { className: 'flex items-start gap-3' },
            h(
              'div',
              {
                className: `rounded-lg p-2 ${
                  alertClasses[alert.color] ||
                  'bg-slate-100 text-slate-600'
                }`,
              },
              h(
                'span',
                { className: 'material-symbols-outlined' },
                alert.icon
              )
            ),
            h(
              'div',
              { className: 'min-w-0' },
              h(
                'h3',
                { className: 'text-sm font-bold text-slate-800' },
                alert.title
              ),
              h(
                'p',
                {
                  className:
                    'mt-1 text-xs leading-5 text-slate-500',
                },
                alert.description
              )
            )
          ),
          h(
            'a',
            {
              href: alert.link,
              className:
                'mt-4 text-xs font-semibold text-emerald-700 hover:underline',
            },
            `${alert.action} →`
          )
        )
      )
    )
  );
