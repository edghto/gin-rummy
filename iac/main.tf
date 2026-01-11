locals {
  apis = [
    "aiplatform.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "container.googleapis.com",
    "logging.googleapis.com",
    "run.googleapis.com",
    "compute.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
  ]
}

terraform {
  required_version = "~> 1.14.3"
}

provider "google" {
  project     = var.project_id
  region      = var.region
}

resource "google_project_service" "enable_apis" {
  for_each = toset(local.apis)
  project  = var.project_id
  service  = each.value
}

module "docker_artifact_registry" {
  source     = "git::https://github.com/GoogleCloudPlatform/cloud-foundation-fabric.git//modules/artifact-registry?ref=v51.0.0"
  project_id = var.project_id
  location   = var.region
  name       = "containers"
  format     = { docker = { standard = {} } }
}

module "gin_rummy_app" {
  source     = "git::https://github.com/GoogleCloudPlatform/cloud-foundation-fabric.git//modules/cloud-run-v2?ref=v51.0.0"
  project_id = var.project_id
  name       = "gin-rummy-app"
  region     = var.region
  containers = {
    app = {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/containers/wemann/gin-rummy-app:v1.0.0"
      ports = {
        default = {
          container_port = 80
        }
      }
    }
  }
  service_config = {
    invoker_iam_disabled = true
    max_instance_count   = 1
  }
  deletion_protection = false
}


module "gin_rummy_server" {
  source     = "git::https://github.com/GoogleCloudPlatform/cloud-foundation-fabric.git//modules/cloud-run-v2?ref=v51.0.0"
  project_id = var.project_id
  name       = "gin-rummy-server"
  region     = var.region
  containers = {
    server = {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/containers/wemann/gin-rummy-server:v1.0.0"
      env = {
        GOOGLE_GENAI_USE_VERTEXAI = "true"
        GOOGLE_CLOUD_PROJECT = "${var.project_id}"
        GOOGLE_CLOUD_LOCATION = "europe-north1" # location of ai model - not every location is available
      }
    }
  }
  service_config = {
    invoker_iam_disabled = true
    max_instance_count   = 1
  }
  deletion_protection = false
}


data "google_compute_network" "vpc_network" {
  name = "default"
}


module "alb" {
  source     = "git::https://github.com/GoogleCloudPlatform/cloud-foundation-fabric.git//modules/net-lb-app-ext-regional?ref=v51.0.0"
  name       = "alb-gin-rummy-0"
  project_id = var.project_id
  region     = var.region
  vpc        = data.google_compute_network.vpc_network.self_link

  backend_service_configs = {
    server = {
      backends = [
        { backend = "neg-server-0" }
      ]
      health_checks = []
    }
    app = {
      backends = [
        { backend = "neg-app-0" }
      ]
      health_checks = []
    }
  }

  urlmap_config = {
    default_service = "app"
    host_rules = [{
      hosts        = ["*"]
      path_matcher = "pathmap"
    }]
    path_matchers = {
      pathmap = {
        default_service = "app"
        path_rules = [{
          paths   = ["/api/player/turn"]
          service = "server"
        }]
      }
    }
  }

  health_check_configs = {}
  neg_configs = {
    neg-server-0 = {
      cloudrun = {
        region = var.region
        target_service = {
          name = module.gin_rummy_server.resource_name
        }
      }
    }
    neg-app-0 = {
      cloudrun = {
        region = var.region
        target_service = {
          name = module.gin_rummy_app.resource_name
        }
      }
    }
  }
}

data "google_service_account" "service_account" {
  account_id = "gin-rummy-server"
  project    = var.project_id
}

resource "google_project_iam_member" "project" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${data.google_service_account.service_account.email}"
}
