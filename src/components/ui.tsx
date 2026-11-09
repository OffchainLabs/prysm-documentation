/**
 * Page components used across the docs (Aside, Steps, Tabs, LinkCard,
 * CardGrid, Card, Badge, FileTree), built on Docusaurus theme components.
 * Import them from '@site/src/components/ui'.
 */
import React, { Children, isValidElement, type ReactNode } from 'react';
import Admonition from '@theme/Admonition';
import ThemeTabs from '@theme/Tabs';
import ThemeTabItem from '@theme/TabItem';
import Link from '@docusaurus/Link';
import clsx from 'clsx';

type AsideType = 'note' | 'tip' | 'caution' | 'danger';
const admonitionType: Record<AsideType, string> = { note: 'note', tip: 'tip', caution: 'warning', danger: 'danger' };

export function Aside({ type = 'note', title, children }: { type?: AsideType; title?: string; children: ReactNode }) {
	return (
		<Admonition type={admonitionType[type]} title={title}>
			{children}
		</Admonition>
	);
}

/** Wraps an ordered list and renders it as numbered steps. */
export function Steps({ children }: { children: ReactNode }) {
	return <div className="ui-steps">{children}</div>;
}

interface TabItemProps {
	label: string;
	children: ReactNode;
}

/** Placeholder element: <Tabs> reads its props and renders theme tab items. */
export function TabItem(_props: TabItemProps): ReactNode {
	return null;
}

/** Tabs with the same `syncKey` stay in sync across the site. */
export function Tabs({ syncKey, children }: { syncKey?: string; children: ReactNode }) {
	const items = Children.toArray(children).filter(
		(c): c is React.ReactElement<TabItemProps> => isValidElement(c) && typeof (c.props as TabItemProps).label === 'string',
	);
	return (
		<ThemeTabs groupId={syncKey} lazy={false}>
			{items.map((item) => (
				<ThemeTabItem key={item.props.label} value={item.props.label} label={item.props.label}>
					{item.props.children}
				</ThemeTabItem>
			))}
		</ThemeTabs>
	);
}

export function CardGrid({ children }: { children: ReactNode }) {
	return <div className="ui-card-grid">{children}</div>;
}

export function LinkCard({ title, description, href }: { title: string; description?: string; href: string }) {
	return (
		<Link className="ui-link-card" to={href}>
			<span className="ui-link-card-title">{title}</span>
			{description && <span className="ui-link-card-desc">{description}</span>}
			<span className="ui-link-card-arrow" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="20" height="20">
					<path fill="currentColor" d="M13.3 5.3a1 1 0 0 1 1.4 0l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 1 1-1.4-1.4l4.3-4.3H4a1 1 0 1 1 0-2h13.6l-4.3-4.3a1 1 0 0 1 0-1.4Z" />
				</svg>
			</span>
		</Link>
	);
}

export function Card({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="ui-card">
			<p className="ui-card-title">{title}</p>
			{children}
		</div>
	);
}

export function Badge({ text, variant = 'note' }: { text: string; variant?: string }) {
	return <span className={clsx('ui-badge', `ui-badge-${variant}`)}>{text}</span>;
}

/**
 * FileTree takes a markdown list; indentation becomes the tree.
 * Names ending in `/` are directories.
 */
export function FileTree({ children }: { children: ReactNode }) {
	return <div className="ui-file-tree">{children}</div>;
}
