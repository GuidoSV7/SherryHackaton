import { NextRequest, NextResponse } from "next/server";
import { avalancheFuji } from "viem/chains";
import {
  createMetadata,
  Metadata,
  ValidatedMetadata,
  ExecutionResponse,
} from "@sherrylinks/sdk";
import { serialize } from "wagmi";

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const serverUrl = `${protocol}://${host}`;

    const metadata: Metadata = {
      url: "https://sherry.social",
      icon: "https://avatars.githubusercontent.com/u/117962315",
      title: "Mensaje con Timestamp",
      baseUrl: serverUrl,
      description:
        "Almacena un mensaje con un timestamp optimizado calculado por nuestro algoritmo",
      actions: [
        {
          type: "dynamic",
          label: "Almacenar Mensaje",
          description:
            "Almacena tu mensaje con un timestamp personalizado calculado para almacenamiento óptimo",
          chains: { source: "fuji" },
          path: `/api/example`,
          params: [
            {
              name: "mensaje",
              label: "¡Tu Mensaje Hermano!",
              type: "text",
              required: true,
              description:
                "Ingresa el mensaje que quieres almacenar en la blockchain",
            },
          ],
        },
      ],
    };

    // Validar metadata usando el SDK
    const validated: ValidatedMetadata = createMetadata(metadata);

    // Retornar con headers CORS para acceso cross-origin
    return NextResponse.json(validated, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
    });
  } catch (error) {
    console.error("Error creando metadata:", error);
    return NextResponse.json(
      { error: "Error al crear metadata" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mensaje = searchParams.get('mensaje');

    if (!mensaje) {
      return NextResponse.json(
        { error: 'El parámetro mensaje es requerido' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
      );
    }

    const tx = {
      to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52',
      value: BigInt(1000000),
      chainId: avalancheFuji.id,
    };

    // Serializar la transacción para la blockchain
    const serialized = serialize(tx);

    // Crear el objeto de respuesta que Sherry espera
    const resp: ExecutionResponse = {
      serializedTransaction: serialized,
      chainId: avalancheFuji.name, // Usar el nombre de la chain, no el ID
    };

    // Retornar la respuesta con headers CORS
    return NextResponse.json(resp, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error en petición POST:', error);
    return NextResponse.json({ error: 'Error Interno del Servidor' }, { status: 500 });
  }
}