import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Slot } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-GCsEU1D_.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[transform,background-color,color,box-shadow,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mark/50 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			primary: "bg-ink text-paper hover:bg-ink/90 active:scale-[0.98]",
			mark: "bg-mark text-mark-ink hover:bg-mark/90 active:scale-[0.98]",
			secondary: "bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--color-rule)] hover:bg-raised",
			ghost: "bg-transparent text-mist hover:text-ink hover:bg-raised",
			danger: "bg-transparent text-danger hover:bg-danger/10"
		},
		size: {
			sm: "h-9 px-3 text-xs",
			md: "h-11 px-4 text-sm",
			lg: "h-12 px-5 text-sm",
			icon: "size-10"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { cn as n, Button as t };
