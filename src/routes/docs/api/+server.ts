export async function GET({ request }: any) {
    return new Response(JSON.stringify("").trim(),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}