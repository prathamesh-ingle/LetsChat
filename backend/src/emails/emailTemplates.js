// src/emails/emailTemplates.js
export function createWelcomeEmailTemplate(name, clientURL) {
  const firstName = (name || "").split(" ")[0] || "there";

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to LetsChat</title>
    <style>
      /* Mobile stacking for clients that support media queries */
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          max-width: 100% !important;
        }
        .stack-column,
        .stack-column td {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        .stack-padding {
          padding-right: 16px !important;
          padding-left: 16px !important;
        }
        /* Prevent inner cards from overflowing horizontally */
        .card-table {
          width: 100% !important;
          max-width: 100% !important;
        }
        .card-table td {
          box-sizing: border-box !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
        }
      }
    </style>
  </head>
  <body style="
    margin: 0;
    padding: 0;
    background-color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #e5e7eb;
  ">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="container" style="
            width: 100%;
            max-width: 640px;
            background-color: #020617;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid rgba(45,212,191,0.7);
            box-shadow: 0 70px 200px rgba(15,23,42,0.95);
          ">

            <!-- HEADER BAR -->
            <tr>
              <td style="
                padding: 14px 22px;
                background:
                  radial-gradient(circle at 0% 0%, #22c55e 0, transparent 55%),
                  radial-gradient(circle at 100% 0%, #0ea5e9 0, transparent 55%),
                  #020617;
                border-bottom: 1px solid rgba(45,212,191,0.8);
              ">
                <table role="presentation" width="100%">
                  <tr>
                    <td align="left">
                      <div style="display: inline-flex; align-items: center; gap: 10px;">
                        <div style="
                          width: 36px;
                          height: 36px;
                          border-radius: 999px;
                          background: radial-gradient(circle at 30% 0,#ffffff 0,#22c55e 35%,#0ea5e9 75%);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          box-shadow: 0 0 0 1px rgba(15,23,42,0.9),0 16px 32px rgba(15,23,42,0.9);
                        ">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#020617"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            style="display:block;"
                          >
                            <path d="M7.5 11.5h.01"></path>
                            <path d="M12 11.5h.01"></path>
                            <path d="M16.5 11.5h.01"></path>
                            <path d="M3 11.5a8.5 8.5 0 0 1 13.89-6.39A8.5 8.5 0 0 1 12 20a8.62 8.62 0 0 1-3.36-.68L3 21l1.68-4.64A8.46 8.46 0 0 1 3 11.5z"></path>
                          </svg>
                        </div>
                        <div>
                          <div style="font-size: 16px; color: #f9fafb; font-weight: 600;">
                            LetsChat
                          </div>
                          <div style="font-size: 11px; color: #bbf7d0;">
                            Fast, encrypted chat for the people you trust
                          </div>
                        </div>
                      </div>
                    </td>
                    <td align="right" style="font-size: 11px; color: #a5f3fc;">
                      Workspace created · ${new Date().getFullYear()}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- MAIN LAYOUT -->
            <tr>
              <td style="padding: 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr class="stack-column">
                    <!-- LEFT: MAIN CONTENT -->
                    <td class="stack-padding" style="padding: 22px 22px 18px; width: 65%; min-width: 260px;">
                      <p style="margin: 0 0 6px; font-size: 13px; color: #a5f3fc;">
                        Welcome, ${firstName}
                      </p>
                      <h1 style="
                        margin: 0 0 10px;
                        color: #f9fafb;
                        font-size: 24px;
                        letter-spacing: 0.01em;
                      ">
                        Your new chat home is ready.
                      </h1>
                      <p style="
                        margin: 0 0 18px;
                        font-size: 14px;
                        color: #e0f2fe;
                        max-width: 460px;
                      ">
                        Start real‑time conversations with friends, classmates, or teammates—on desktop or mobile, with typing indicators, media sharing, and video calls built in.
                      </p>

                      <!-- CARD TABLE 1 -->
                      <table role="presentation" width="100%" class="card-table" style="
                        margin: 8px 0 4px;
                        border-radius: 14px;
                        background:
                          radial-gradient(circle at top left, rgba(45,212,191,0.18), transparent 55%),
                          radial-gradient(circle at bottom right, rgba(56,189,248,0.18), transparent 55%),
                          #020617;
                        border: 1px solid rgba(45,212,191,0.7);
                      ">
                        <tr>
                          <td style="padding: 14px 16px 4px;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #f9fafb; font-weight: 600;">
                              Get the most from LetsChat
                            </p>
                            <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #e0f2fe;">
                              <li style="margin-bottom: 6px;">
                                <strong style="font-weight: 600;">Update your profile.</strong> Add a picture and short bio so people know they’re talking to you.
                              </li>
                              <li style="margin-bottom: 6px;">
                                <strong style="font-weight: 600;">Pin your close people.</strong> Star your favourite chats so friends and key teammates are one tap away.
                              </li>
                              <li style="margin-bottom: 4px;">
                                <strong style="font-weight: 600;">Create focused channels.</strong> Separate friends, projects, and study groups to keep threads clean.
                              </li>
                            </ul>
                          </td>
                        </tr>
                      </table>

                      <div style="text-align: left; margin: 22px 0 10px;">
                        <a href="${clientURL}" style="
                          display: inline-block;
                          padding: 11px 26px;
                          border-radius: 999px;
                          background-image: linear-gradient(135deg, #22c55e, #0ea5e9);
                          color: #022c22;
                          font-size: 13px;
                          font-weight: 700;
                          letter-spacing: 0.12em;
                          text-transform: uppercase;
                          text-decoration: none;
                          box-shadow: 0 12px 30px rgba(16,185,129,0.75);
                        ">
                          Open LetsChat
                        </a>
                        <p style="margin: 10px 0 0; font-size: 11px; color: #93c5fd;">
                          Or paste this link into your browser:<br />
                          <span style="color: #e0f2fe;">${clientURL}</span>
                        </p>
                      </div>

                      <p style="margin: 18px 0 6px; font-size: 12px; color: #7dd3fc;">
                        If this wasn’t you, you can safely ignore this email or contact our support team.
                      </p>
                    </td>

                    <!-- RIGHT: ACTIVITY SIDEBAR -->
                    <td class="stack-padding" style="
                      width: 35%;
                      min-width: 180px;
                      padding: 22px 20px 18px 0;
                      border-left: 1px solid rgba(15,23,42,1);
                      background:
                        radial-gradient(circle at top, rgba(56,189,248,0.22), transparent 55%);
                    ">
                      <!-- CARD TABLE 2 -->
                      <table role="presentation" width="100%" class="card-table" style="
                        border-radius: 14px;
                        background-color: #020617;
                        border: 1px solid rgba(30,64,175,0.8);
                      ">
                        <tr>
                          <td style="padding: 12px 12px 6px;">
                            <p style="margin: 0 0 6px; font-size: 12px; color: #f9fafb; font-weight: 600;">
                              What you can do today
                            </p>
                            <p style="margin: 0 0 10px; font-size: 11px; color: #bfdbfe;">
                              A quick preview of your new chat workspace:
                            </p>

                            <div style="margin-bottom: 8px;">
                              <div style="font-size: 11px; color: #a5f3fc; margin-bottom: 2px;">
                                Live presence
                              </div>
                              <div style="font-size: 12px; color: #e0f2fe;">
                                See who is online, typing, or in a call—so you always know when to jump in.
                              </div>
                            </div>

                            <div style="margin: 10px 0 8px; border-top: 1px dashed rgba(51,65,85,0.9); padding-top: 8px;">
                              <div style="font-size: 11px; color: #a5f3fc; margin-bottom: 2px;">
                                Rich media chats
                              </div>
                              <div style="font-size: 12px; color: #e0f2fe;">
                                Share photos, docs, and reactions in a single thread instead of across apps.
                              </div>
                            </div>

                            <div style="margin: 10px 0 0; border-top: 1px dashed rgba(51,65,85,0.9); padding-top: 8px;">
                              <div style="font-size: 11px; color: #a5f3fc; margin-bottom: 2px;">
                                One‑click calls
                              </div>
                              <div style="font-size: 12px; color: #e0f2fe;">
                                Turn any chat into a video call when you need to talk face‑to‑face.
                              </div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="
                padding: 14px 22px 20px;
                border-top: 1px solid rgba(15,23,42,1);
                background-color: #020617;
                text-align: center;
              ">
                <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">
                  You’re receiving this message because a LetsChat account was created with this address.
                </p>
                <p style="margin: 0; font-size: 11px; color: #64748b;">
                  © ${new Date().getFullYear()} LetsChat. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
