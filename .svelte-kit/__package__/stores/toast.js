var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';
var TOAST_KEY = Symbol('toast');
/**
 * Create toast context for ToastProvider
 * @returns Toast context with toasts store and methods
 */
export function createToastContext() {
    var toasts = writable([]);
    var showToast = function (options) {
        var id = "toast-".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 9));
        var position = options.position || 'top-right';
        toasts.update(function (items) { return __spreadArray(__spreadArray([], items, true), [__assign({ id: id, position: position }, options)], false); });
        return id;
    };
    var hideToast = function (id) {
        toasts.update(function (items) { return items.filter(function (t) { return t.id !== id; }); });
    };
    var context = { toasts: toasts, showToast: showToast, hideToast: hideToast };
    setContext(TOAST_KEY, context);
    return context;
}
/**
 * Get toast context from parent ToastProvider
 * @returns Toast context
 * @throws Error if used outside ToastProvider
 */
export function useToast() {
    var context = getContext(TOAST_KEY);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
export default { createToastContext: createToastContext, useToast: useToast };
