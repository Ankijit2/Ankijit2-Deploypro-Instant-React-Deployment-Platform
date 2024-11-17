/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

const apiURL = process.env.API_URL;
import axios from "axios";
import { cookies } from "next/headers";
import z from 'zod'
import { ProjectSchema } from "@/type";

export async function createProject(data:z.infer<typeof ProjectSchema> ) {
  // Retrieve the session cookie
  const cookie = cookies().get("authjs.session-token");

  if (!cookie) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  try {
    // Perform the POST request
    const response = await axios.post(
      `http://localhost:4000/deploy`,
      data, // Pass `data` directly as the payload
      {
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );

    // Return the API response
    return {
      error: false,
      data: response.data,
    };
  } catch (error:any)  {
    console.error(error);
    

    // Handle Axios errors gracefully
    return {
      error: true,
      message: error.data
    };
  }
}


export async function createLogs( deployment_id: string ) {
  const cookie = cookies().get("authjs.session-token");
  if (!cookie) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  try {
    const response = await axios.get(`${apiURL}/logs/${deployment_id}`, {
      headers: {
        Authorization: `Bearer ${cookie.value}`,
      },
    })
    return {
        error: false,
        data: response.data
    }
}catch{
    return {
        error: true,
        message: "Failed to fetch logs"
    }
}

}