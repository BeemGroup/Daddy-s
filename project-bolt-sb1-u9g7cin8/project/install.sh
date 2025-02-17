#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables globales
REPO_URL="https://github.com/BeemGroup/Daddy-s.git"

# Fonction pour afficher les messages
log() {
    echo -e "${2}${1}${NC}"
}

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Fonction pour vérifier l'OS
check_os() {
    if [[ ! -f /etc/os-release ]]; then
        log "Impossible de détecter le système d'exploitation" "$RED"
        exit 1
    fi

    source /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        log "Ce script est conçu pour Ubuntu. OS détecté: $ID" "$RED"
        exit 1
    fi

    log "OS détecté: Ubuntu $VERSION_ID" "$BLUE"
}

# Vérification des privilèges root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log "Ce script doit être exécuté en tant que root" "$RED"
        log "Utilisez: sudo $0" "$YELLOW"
        exit 1
    fi
}

# Vérification de l'espace disque
check_disk_space() {
    local free_space
    free_space=$(df -k / | awk 'NR==2 {print $4}')
    local min_space=5242880 # 5GB en KB

    if [[ $free_space -lt $min_space ]]; then
        log "Espace disque insuffisant. Minimum requis: 5GB" "$RED"
        exit 1
    fi
}

# Installation des dépendances système
install_system_dependencies() {
    log "Installation des dépendances système..." "$YELLOW"
    
    # Mise à jour des paquets
    apt update || {
        log "Erreur lors de la mise à jour des paquets" "$RED"
        exit 1
    }

    # Installation des paquets essentiels
    apt install -y \
        curl \
        git \
        build-essential \
        nginx \
        ufw \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        || {
        log "Erreur lors de l'installation des dépendances système" "$RED"
        exit 1
    }
}

# Installation de Node.js
install_nodejs() {
    log "Installation de Node.js..." "$YELLOW"

    if ! command_exists node; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - || {
            log "Erreur lors de l'ajout du dépôt Node.js" "$RED"
            exit 1
        }
        apt install -y nodejs || {
            log "Erreur lors de l'installation de Node.js" "$RED"
            exit 1
        }
    else
        log "Node.js est déjà installé" "$GREEN"
    fi

    # Vérification de l'installation
    node --version || {
        log "Erreur: Node.js n'est pas correctement installé" "$RED"
        exit 1
    }
}

# Installation de PM2
install_pm2() {
    log "Installation de PM2..." "$YELLOW"

    if ! command_exists pm2; then
        npm install -g pm2 || {
            log "Erreur lors de l'installation de PM2" "$RED"
            exit 1
        }
    else
        log "PM2 est déjà installé" "$GREEN"
    fi
}

# Configuration de Nginx
configure_nginx() {
    log "Configuration de Nginx..." "$YELLOW"

    # Création du fichier de configuration
    cat > /etc/nginx/sites-available/daddys-kitchen << 'EOL'
server {
    listen 80;
    server_name _;
    root /var/www/daddys-kitchen/dist;
    index index.html;

    # Gestion des fichiers statiques
    location /assets {
        expires 1y;
        add_header Cache-Control "public, no-transform";
        try_files $uri $uri/ =404;
    }

    # Configuration pour l'application React
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Logs
    access_log /var/log/nginx/daddys-kitchen.access.log;
    error_log /var/log/nginx/daddys-kitchen.error.log;

    # Gestion des erreurs
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOL

    # Activation du site
    ln -sf /etc/nginx/sites-available/daddys-kitchen /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # Test de la configuration
    nginx -t || {
        log "Erreur dans la configuration Nginx" "$RED"
        exit 1
    }

    # Redémarrage de Nginx
    systemctl restart nginx || {
        log "Erreur lors du redémarrage de Nginx" "$RED"
        exit 1
    }
}

# Configuration du pare-feu
configure_firewall() {
    log "Configuration du pare-feu..." "$YELLOW"

    # Activation du pare-feu
    ufw enable || {
        log "Erreur lors de l'activation du pare-feu" "$RED"
        exit 1
    }

    # Ouverture des ports nécessaires
    ufw allow 'Nginx Full' || {
        log "Erreur lors de l'ouverture des ports Nginx" "$RED"
        exit 1
    }

    ufw allow ssh || {
        log "Erreur lors de l'ouverture du port SSH" "$RED"
        exit 1
    }
}

# Déploiement de l'application
deploy_application() {
    log "Déploiement de l'application..." "$YELLOW"

    # Création du répertoire de l'application
    mkdir -p /var/www/daddys-kitchen || {
        log "Erreur lors de la création du répertoire" "$RED"
        exit 1
    }

    # Configuration des permissions
    chown -R www-data:www-data /var/www/daddys-kitchen
    chmod -R 755 /var/www/daddys-kitchen

    # Clonage du projet
    if [[ -d /var/www/daddys-kitchen/.git ]]; then
        cd /var/www/daddys-kitchen && git pull
    else
        git clone "$REPO_URL" /var/www/daddys-kitchen || {
            log "Erreur lors du clonage du projet depuis $REPO_URL" "$RED"
            exit 1
        }
    fi

    # Installation des dépendances
    cd /var/www/daddys-kitchen || exit 1
    npm install || {
        log "Erreur lors de l'installation des dépendances Node.js" "$RED"
        exit 1
    }

    # Build de l'application
    npm run build || {
        log "Erreur lors du build de l'application" "$RED"
        exit 1
    }

    # Configuration de PM2
    pm2 start npm --name "daddys-kitchen" -- start || {
        log "Erreur lors du démarrage de l'application avec PM2" "$RED"
        exit 1
    }

    pm2 save || {
        log "Erreur lors de la sauvegarde de la configuration PM2" "$RED"
        exit 1
    }
}

# Fonction principale
main() {
    log "Installation de Daddy's Dark Kitchen" "$GREEN"
    log "----------------------------------------" "$BLUE"

    # Vérifications initiales
    check_os
    check_root
    check_disk_space

    # Installation et configuration
    install_system_dependencies
    install_nodejs
    install_pm2
    configure_nginx
    configure_firewall
    deploy_application

    log "----------------------------------------" "$BLUE"
    log "Installation terminée avec succès !" "$GREEN"
    log "L'application est accessible sur : http://votre-ip" "$GREEN"
    log "\nPour mettre à jour l'application :" "$YELLOW"
    log "1. cd /var/www/daddys-kitchen" "$BLUE"
    log "2. git pull" "$BLUE"
    log "3. npm install" "$BLUE"
    log "4. npm run build" "$BLUE"
    log "5. systemctl restart nginx" "$BLUE"
    log "6. pm2 restart daddys-kitchen" "$BLUE"
}

# Exécution du script
main
