/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Firebase removido conforme solicitado.
// O site funcionará apenas com LocalStorage (modo offline/local).

export const db = null;
export const isFirebaseReady = false;

export const updateFirebaseSettings = (config: any) => {
  console.log("Firebase desativado.");
};
