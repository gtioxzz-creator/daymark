import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as GROK_PROVIDERS } from "./router-B1Kj0Ltr.mjs";
import { n as signIn } from "./client-7PpZLKX8.mjs";
import { t as Button } from "./button-GCsEU1D_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-XHEzVGd9.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-paper px-6 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Daymark"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-title",
					children: "Sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-mist",
					children: "Your life stays on this device. Sign in only if you want an identity attached to the room."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 space-y-2",
					children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "secondary",
						className: "w-full",
						onClick: () => signIn(provider.providerId, { callbackURL: "/" }),
						children: ["Continue with ", provider.label]
					}, provider.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-8 inline-block text-sm text-mist hover:text-ink",
					children: "Back to the day"
				})
			]
		})
	});
}
//#endregion
export { Login as component };
