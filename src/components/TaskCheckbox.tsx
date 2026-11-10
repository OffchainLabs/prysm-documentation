import { useEffect, useRef, useState, type ComponentProps } from 'react';

const PREFIX = 'prysm-checklist:';

/**
 * A Markdown task-list checkbox (`- [ ]`) the reader can tick. Each box is
 * remembered in localStorage, keyed by the page and its list item's text, so
 * progress survives a reload.
 */
export default function TaskCheckbox({ checked: initial, disabled: _disabled, ...props }: ComponentProps<'input'>) {
	const ref = useRef<HTMLInputElement>(null);
	const [key, setKey] = useState<string>();
	const [checked, setChecked] = useState(Boolean(initial));

	useEffect(() => {
		const text = ref.current?.closest('li')?.textContent?.trim();
		if (!text) return;
		const k = `${PREFIX}${location.pathname}:${text}`;
		setKey(k);
		try {
			const saved = localStorage.getItem(k);
			if (saved !== null) setChecked(saved === '1');
		} catch {}
	}, []);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(e.target.checked);
		if (!key) return;
		try {
			localStorage.setItem(key, e.target.checked ? '1' : '0');
		} catch {}
	};

	return <input {...props} ref={ref} type="checkbox" checked={checked} onChange={onChange} />;
}
