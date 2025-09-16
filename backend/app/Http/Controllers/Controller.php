<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="Plataforma Calendario API",
 *     version="1.0.0",
 *     description="API REST para la gestión de calendario de eventos organizacionales",
 *
 *     @OA\Contact(
 *         email="admin@plataforma-calendario.com",
 *         name="Plataforma Calendario Team"
 *     )
 * )
 *
 * @OA\Server(
 *     url="/api",
 *     description="API Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter token in format (Bearer <token>)"
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="Endpoints para autenticación de usuarios"
 * )
 * @OA\Tag(
 *     name="Categories",
 *     description="Endpoints para gestión de categorías"
 * )
 */
abstract class Controller
{
    //
}
