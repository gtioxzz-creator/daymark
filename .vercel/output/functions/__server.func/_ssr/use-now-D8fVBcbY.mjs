import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-now-D8fVBcbY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useNow(interval = 1e3) {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		setReady(true);
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), interval);
		return () => window.clearInterval(id);
	}, [interval]);
	return {
		now,
		ready
	};
}
//#endregion
export { useNow as t };
