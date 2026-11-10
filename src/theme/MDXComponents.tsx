import type { ComponentProps } from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import TaskCheckbox from '@site/src/components/TaskCheckbox';

export default {
	...MDXComponents,
	// Task-list boxes render disabled by default; make them tickable.
	input: (props: ComponentProps<'input'>) =>
		props.type === 'checkbox' ? <TaskCheckbox {...props} /> : <input {...props} />,
};
