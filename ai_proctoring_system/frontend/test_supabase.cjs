const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kmfeacomvfkwpqhzukbg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZmVhY29tdmZrd3BxaHp1a2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjA2ODksImV4cCI6MjA4NjYzNjY4OX0.U3xhuf8HKpl28hG0oNbJPhv48SYmkgb21CTQNft-NR0'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

    console.log(JSON.stringify(data, null, 2))
}

test()
