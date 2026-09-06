import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  verifyAdminPassword,
} from "../../../../lib/admin-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (
      !password ||
      !verifyAdminPassword(password)
    ) {
      return NextResponse.json(
        {
          error:
            "Incorrect administrator password.",
        },
        {
          status: 401,
        }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: createAdminSessionToken(),
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error(
      "Administrator login error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to log in as administrator.",
      },
      {
        status: 500,
      }
    );
  }
} 
