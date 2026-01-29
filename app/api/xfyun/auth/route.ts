import { NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'

// iFlytek credentials
const APPID = process.env.XFYUN_APPID || 'e842882f'
const API_KEY = process.env.XFYUN_API_KEY || '0bfb694bd02b21bd32c14882fd71aa03'

export async function GET() {
  try {
    // Generate timestamp (seconds since epoch)
    const ts = Math.floor(Date.now() / 1000).toString()
    
    // Generate signa
    // 1. baseString = appid + ts
    const baseString = APPID + ts
    
    // 2. MD5(baseString)
    const md5Result = CryptoJS.MD5(baseString).toString()
    
    // 3. HmacSHA1(md5Result, apiKey) then base64
    const hmacResult = CryptoJS.HmacSHA1(md5Result, API_KEY)
    const signa = CryptoJS.enc.Base64.stringify(hmacResult)
    
    // Build WebSocket URL
    const params = new URLSearchParams({
      appid: APPID,
      ts: ts,
      signa: signa,
      lang: 'cn', // Chinese + English mixed
      pd: 'car',  // Automotive domain
    })
    
    const wsUrl = `wss://rtasr.xfyun.cn/v1/ws?${params.toString()}`
    
    return NextResponse.json({
      url: wsUrl,
      appid: APPID,
      ts,
      signa,
    })
  } catch (error) {
    console.error('Failed to generate iFlytek auth:', error)
    return NextResponse.json(
      { error: 'Failed to generate authentication' },
      { status: 500 }
    )
  }
}
