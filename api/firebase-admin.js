import {
  applicationDefault,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault(),
        projectId: "arunodaya-collections-583f3",
      });

export const firebaseAuth = getAuth(app);