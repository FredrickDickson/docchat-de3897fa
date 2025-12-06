
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_PUBLISHABLE_KEY; // Using anon key

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Debugging Supabase ---');

    // 1. Check if 'profiles' table exists and is accessible
    console.log('\nChecking "profiles" table...');
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

    if (profilesError) {
        console.error('Error accessing profiles:', profilesError);
    } else {
        console.log('Profiles table accessible.');
    }

    // 2. Check if "credits" table exists
    console.log('\nChecking "credits" table...');
    const { data: credits, error: creditsError } = await supabase
        .from('credits')
        .select('count')
        .limit(1);

    if (creditsError) {
        console.error('Error accessing credits:', creditsError);
    } else {
        console.log('Credits table accessible.');
    }

    // 2.5 Check if "public.users" table is accessible via 'users' alias common in Supabase?
    // Usually 'users' refers to public.users if exposed.
    console.log('\nChecking "users" table...');
    const { data: publicUsers, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

    if (usersError) {
        console.error('Error accessing users:', usersError);
    } else {
        console.log('Users table accessible.');
    }

    // 3. Check storage bucket 'pdf-uploads'
    console.log('\nChecking storage bucket "pdf-uploads"...');
    const { data: files, error: storageError } = await supabase
        .storage
        .from('pdf-uploads')
        .list();

    if (storageError) {
        console.error('Error accessing pdf-uploads bucket:', storageError);
    } else {
        console.log('pdf-uploads bucket accessible. Files in root:', files?.length);
    }

    // 4. Try to sign in to test RLS
    console.log('\nAttempting sign in to test uploads...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'dicksonfkd@gmail.com',
        password: '12345678'
    });

    if (authError) {
        console.error('Sign in failed:', authError);
        return;
    } else {
        console.log('Sign in successful:', authData.user.id);

        // Check if user has a profile row
        const { data: userProfile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

        if (profileErr) {
            console.error('User profile lookup failed:', profileErr);
        } else {
            console.log('User profile found:', userProfile.id);
        }

        // Check if user exists in public.users
        // Note: direct select on users might fail RLS if not 'own' row, but we are signed in.
        const { data: publicUser, error: pubUserErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .limit(1);

        if (pubUserErr) {
            console.error('public.users lookup failed:', pubUserErr);
        } else if (publicUser && publicUser.length > 0) {
            console.log('User found in public.users');
        } else {
            console.log('User NOT found in public.users');
        }

        // Now try to upload a dummy file
        console.log('Attempting upload...');
        const dummyContent = 'Hello World PDF Content';
        const buffer = Buffer.from(dummyContent, 'utf-8');
        const fileName = `${authData.user.id}/debug-${Date.now()}.txt`;

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('pdf-uploads')
            .upload(fileName, buffer, {
                contentType: 'text/plain',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload failed:', uploadError);
        } else {
            console.log('Upload successful:', uploadData);
            // Cleanup
            await supabase.storage.from('pdf-uploads').remove([fileName]);
        }
    }
}

debug().catch(console.error);
