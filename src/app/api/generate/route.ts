"use server";

export const maxDuration = 60; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

import { revalidatePath } from "next/cache";

import { NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPrompt } from "@/lib/prompt";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

interface generateFormInput {
    userPrompt: string;
}

export async function POST(req: Request) {

  const { userPrompt }: generateFormInput = await req.json();


 
    
  try {
    const finalPrompt = getPrompt(userPrompt);
    
    const result = await model.generateContent(finalPrompt);
   
    const response = result.response;
    const text = response.text();

    const jsonString = text.replace(/^```json\s*([\s\S]*)\s*```$/g, "$1");

    const responseObject = JSON.parse(jsonString, null, 2);



    
    revalidatePath("/");
    return NextResponse.json(responseObject);
  } catch (err) {

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}