const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log("Testing connection to Supabase...");
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Try to select from sessions
  const { data, error } = await supabase.from('sessions').select('*').limit(1);
  
  if (error) {
    console.error("Select Error:", error.message);
  } else {
    console.log("Select Success! Found rows:", data?.length);
  }

  // Try to insert
  console.log("\nAttempting to insert a row to test RLS...");
  const { data: insertData, error: insertError } = await supabase
    .from('sessions')
    .insert({})
    .select()
    .single();

  if (insertError) {
    console.error("Insert Error (This is likely the RLS issue!):", insertError.message);
  } else {
    console.log("Insert Success! Session ID:", insertData.id);
  }
}

testConnection();
