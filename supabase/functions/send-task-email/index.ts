import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method not allowed",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Read request body
    const { email, taskTitle, description, priority, dueDate } = await req.json();

    // Validate required fields
    if (!email || !taskTitle) {
      return new Response(
        JSON.stringify({
          error: "Email and task title are required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Send email using Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [email],
        subject: `New Task Assigned: ${taskTitle}`,
        html: `
          <h2>New Task Assigned</h2>

          <p>You have been assigned a new task.</p>

          <h3>${taskTitle}</h3>

          <p>
            <strong>Description:</strong>
            ${description ?? ""}
          </p>

          <p>
            <strong>Priority:</strong>
            ${priority ?? ""}
          </p>

          <p>
            <strong>Due Date:</strong>
            ${dueDate ?? ""}
          </p>

          <p>
            Please check your task dashboard for more details.
          </p>
        `,
      }),
    });

    const result = await response.json();

    // Resend returned an error
    if (!response.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Task email sent successfully",
        data: result,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Email function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
