import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.http.content.staticResources
import io.ktor.server.netty.EngineMain
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

fun main(args: Array<String>) = EngineMain.main(args)

fun Application.module() {
    configureRouting()
    configureSerialization()
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
