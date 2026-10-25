// src/utils/middlecontentUtils.js
// Neumorphic version. Requires the neu-* utilities from index.css.
import React from 'react';

const h = React.createElement;

const formatINR = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

// Skeleton
export const Skeleton = ({ className = '' }) =>
  h('span', {
    className: `inline-block animate-pulse rounded bg-outline-variant/40 ${className}`,
  });

// Stat Card (colorClass is a TEXT colour only, the icon well is inset)
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

// Shared section wrapper: title, subtitle, optional "view all" link, body
const Section = ({ title, subtitle, count, href, linkLabel, children }) =>
  h(
    'section',
    { className: 'neu-raised flex flex-col rounded-2xl' },
    h(
      'div',
      {
        className:
          'flex items-center justify-between gap-3 border-b border-primary/10 px-4 py-4 sm:px-6',
      },
      h(
        'div',
        { className: 'min-w-0' },
        h(
          'div',
          { className: 'flex items-center gap-2' },
          h('h2', { className: 'font-bold text-primary sm:text-lg' }, title),
          count > 0
            ? h(
                'span',
                {
                  className:
                    'neu-inset-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-secondary',
                },
                count
              )
            : null
        ),
        h('p', { className: 'mt-1 text-xs text-on-surface-variant' }, subtitle)
      ),
      href
        ? h(
            'a',
            {
              href,
              className:
                'neu-btn shrink-0 rounded-lg px-4 py-2 text-xs font-semibold text-secondary',
            },
            linkLabel || 'View all'
          )
        : null
    ),
    h('div', { className: 'flex-1 p-4 sm:p-6' }, children)
  );

const EmptyState = ({ message }) =>
  h('p', { className: 'py-8 text-center text-sm text-outline' }, message);

// Orders awaiting acceptance
export const AwaitingAcceptance = ({ orders = [], onRespond }) =>
  h(
    Section,
    {
      title: 'Awaiting Acceptance',
      subtitle: 'Accept or reject new orders',
      count: orders.length,
      href: '/seller-dashboard/orders',
    },
    orders.length === 0
      ? h(EmptyState, { message: 'No orders waiting for you.' })
      : h(
          'ul',
          { className: 'space-y-4' },
          ...orders.map((order) =>
            h(
              'li',
              { key: order.id, className: 'neu-inset rounded-xl p-4' },
              h(
                'div',
                { className: 'flex items-start justify-between gap-3' },
                h(
                  'div',
                  { className: 'min-w-0' },
                  h(
                    'p',
                    { className: 'text-sm font-bold text-primary' },
                    `${order.id} · ${order.customer}`
                  ),
                  h(
                    'p',
                    { className: 'mt-1 text-xs text-on-surface-variant' },
                    order.items
                  ),
                  h('p', { className: 'mt-1 text-xs text-outline' }, order.placedAgo)
                ),
                h(
                  'p',
                  { className: 'shrink-0 text-sm font-extrabold text-on-surface' },
                  formatINR(order.amount)
                )
              ),
              h(
                'div',
                { className: 'mt-4 flex gap-3' },
                h(
                  'button',
                  {
                    type: 'button',
                    onClick: () => onRespond && onRespond(order.id, 'accept'),
                    className:
                      'neu-btn rounded-lg px-4 py-2 text-xs font-semibold text-secondary',
                  },
                  'Accept'
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    onClick: () => onRespond && onRespond(order.id, 'reject'),
                    className:
                      'neu-btn rounded-lg px-4 py-2 text-xs font-semibold text-error',
                  },
                  'Reject'
                )
              )
            )
          )
        )
  );

// Orders ready for pickup
export const ReadyForPickup = ({ orders = [] }) =>
  h(
    Section,
    {
      title: 'Ready for Pickup',
      subtitle: 'Packed orders waiting for the delivery partner',
      count: orders.length,
      href: '/seller-dashboard/orders',
    },
    orders.length === 0
      ? h(EmptyState, { message: 'Nothing is waiting for pickup.' })
      : h(
          'ul',
          { className: 'space-y-4' },
          ...orders.map((order) =>
            h(
              'li',
              {
                key: order.id,
                className: 'neu-inset flex items-center gap-3 rounded-xl p-4',
              },
              h(
                'div',
                { className: 'neu-raised-sm flex shrink-0 rounded-lg p-2 text-orange-600' },
                h('span', { className: 'material-symbols-outlined' }, 'local_shipping')
              ),
              h(
                'div',
                { className: 'min-w-0 flex-1' },
                h(
                  'p',
                  { className: 'text-sm font-bold text-primary' },
                  `${order.id} · ${order.customer}`
                ),
                h(
                  'p',
                  { className: 'mt-1 text-xs text-on-surface-variant' },
                  `${order.itemCount} ${order.itemCount === 1 ? 'item' : 'items'} · Pickup by ${order.pickupBy}`
                )
              ),
              h(
                'span',
                {
                  className: `neu-inset-sm shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${
                    order.partner ? 'text-secondary' : 'text-amber-700'
                  }`,
                },
                order.partner || 'Partner not assigned'
              )
            )
          )
        )
  );

// Products running low on stock
export const LowStockProducts = ({ products = [] }) =>
  h(
    Section,
    {
      title: 'Low Stock',
      subtitle: 'Products below their reorder level',
      count: products.length,
      href: '/seller-dashboard/products',
      linkLabel: 'Manage stock',
    },
    products.length === 0
      ? h(EmptyState, { message: 'All products are well stocked.' })
      : h(
          'ul',
          { className: 'space-y-5' },
          ...products.map((product) => {
            const critical = product.stock <= product.threshold / 2;
            const percent = Math.min(
              Math.max((product.stock / product.threshold) * 100, 4),
              100
            );
            return h(
              'li',
              { key: product.id },
              h(
                'div',
                { className: 'mb-2 flex items-center justify-between gap-3' },
                h(
                  'p',
                  { className: 'min-w-0 truncate text-sm font-semibold text-primary' },
                  product.name
                ),
                h(
                  'p',
                  {
                    className: `shrink-0 text-xs font-bold ${
                      critical ? 'text-error' : 'text-amber-700'
                    }`,
                  },
                  `${product.stock} left`
                )
              ),
              h(
                'div',
                {
                  className: 'neu-inset-sm h-3 w-full rounded-full p-0.5',
                  role: 'img',
                  'aria-label': `${product.stock} in stock, reorder level ${product.threshold}`,
                },
                h('div', {
                  className: `h-full rounded-full ${
                    critical ? 'bg-error' : 'bg-amber-500'
                  }`,
                  style: { width: `${percent}%` },
                })
              ),
              h(
                'p',
                { className: 'mt-1 text-[10px] text-outline' },
                `Reorder level: ${product.threshold}`
              )
            );
          })
        )
  );

const payoutClasses = {
  PAID: 'text-secondary',
  PROCESSING: 'text-amber-700',
  FAILED: 'text-error',
};

// Pending settlements and recent payouts
export const SettlementsPayouts = ({ settlements }) => {
  const {
    pendingAmount = 0,
    pendingOrders = 0,
    nextPayoutDate = '-',
    recentPayouts = [],
  } = settlements || {};

  return h(
    Section,
    {
      title: 'Settlements & Payouts',
      subtitle: 'Money owed to you and recent transfers',
      href: '/seller-dashboard/payments',
    },
    h(
      'div',
      { className: 'neu-inset mb-5 rounded-xl p-4' },
      h('p', { className: 'text-xs font-medium text-on-surface-variant' }, 'Pending settlement'),
      h(
        'p',
        { className: 'mt-1 text-2xl font-extrabold tracking-tight text-primary' },
        formatINR(pendingAmount)
      ),
      h(
        'p',
        { className: 'mt-1 text-xs text-on-surface-variant' },
        `${pendingOrders} orders · Next payout ${nextPayoutDate}`
      )
    ),
    h('h3', { className: 'mb-3 text-sm font-bold text-primary' }, 'Recent payouts'),
    recentPayouts.length === 0
      ? h(EmptyState, { message: 'No payouts yet.' })
      : h(
          'ul',
          { className: 'divide-y divide-primary/10' },
          ...recentPayouts.map((payout) =>
            h(
              'li',
              {
                key: payout.id,
                className: 'flex items-center justify-between gap-3 py-3',
              },
              h(
                'div',
                { className: 'min-w-0' },
                h('p', { className: 'text-sm font-semibold text-primary' }, payout.id),
                h('p', { className: 'text-xs text-outline' }, payout.date)
              ),
              h(
                'div',
                { className: 'flex shrink-0 items-center gap-3' },
                h(
                  'span',
                  { className: 'text-sm font-semibold text-on-surface' },
                  formatINR(payout.amount)
                ),
                h(
                  'span',
                  {
                    className: `neu-inset-sm rounded-full px-3 py-1 text-[10px] font-bold ${
                      payoutClasses[payout.status] || 'text-on-surface-variant'
                    }`,
                  },
                  payout.status
                )
              )
            )
          )
        )
  );
};