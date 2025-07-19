// src/app/core/services/auth.service.ts
import { Injectable, computed, effect, signal } from '@angular/core';
import { supabase } from '../lib/supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _token = signal<string | null>(null);

    constructor() {
        this.restoreSession();
        this.listenToAuthChanges();
    }

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this._token.set(data.session?.access_token ?? null);
    }

    async restoreSession() {
        const { data } = await supabase.auth.getSession();
        this._token.set(data.session?.access_token ?? null);
    }

    private listenToAuthChanges() {
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                this._token.set(session?.access_token ?? null);
            } else if (event === 'SIGNED_OUT') {
                this._token.set(null);
            }
        });
    }

    readonly accessToken = computed(() => this._token());

    logout() {
        supabase.auth.signOut();
    }
}
