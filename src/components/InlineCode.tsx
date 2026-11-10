/**
 * Renders the `backticked` parts of a plain-text label as inline code, so a
 * sidebar label such as "Add … (`0x00`) validator" shows `0x00` as code.
 */
import React, { type ReactNode } from 'react';

export function inlineCode(text: string): ReactNode {
	if (!text.includes('`')) return text;
	return text.split('`').map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part));
}

/** The label without its backticks, for places that only take text (tab title, structured data). */
export const stripInlineCode = (text: string) => text.replaceAll('`', '');
