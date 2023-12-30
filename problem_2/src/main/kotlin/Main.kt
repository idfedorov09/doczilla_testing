import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.io.File
import java.net.URL

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    configureRouting()
    configureCors()
    configureSerialization()
}

fun Application.configureCors() {
    install(CORS) {
        anyHost()
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.ContentType)
        allowHeaders { true }
    }
}

fun Application.configureRouting() {
    val serverRouter = ServerRouter()
    routing {
        staticResources("/static", "assets")
        studentRouting(serverRouter)
    }
}

fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json()
    }
}

fun Route.studentRouting(
    serverRouter: ServerRouter,
) {
    route("/students/api") {
        put {
            serverRouter.putQuery(call)
        }
        delete("{id?}") {
            serverRouter.deleteQuery(call)
        }
        get {
            serverRouter.getQuery(call)
        }
    }
    staticResources("/", "static", "index.html")
}
