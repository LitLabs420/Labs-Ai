pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
        maven {
            url = uri("https://storage.googleapis.com/download.flutter.io")
        }
    }
    plugins {
        // Ensure the Kotlin Compose Gradle plugin (matching the version catalog) is resolvable
        id("org.jetbrains.kotlin.plugin.compose") version "2.2.21"
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://storage.googleapis.com/download.flutter.io")
        }
    }
}

rootProject.name = "LiTLabs  Player Deluxe"
include(":app")

apply(from = "flutter_module/.android/include_flutter.groovy")
