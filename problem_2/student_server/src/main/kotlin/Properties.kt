enum class Properties(
    private val key: String,
) {
    POSTGRES_URL("pg.url"),
    POSTGRES_USERNAME("pg.username"),
    POSTGRES_PASSWORD("pg.password"),

    ;

    operator fun invoke() = this.key
}
