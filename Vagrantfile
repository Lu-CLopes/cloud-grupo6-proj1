Vagrant.configure("2") do |config|
	is_arm = RUBY_PLATFORM.include?("arm64") || RUBY_PLATFORM.include?("aarch64")

	# VM 1 - Frontend
	config.vm.define "frontend" do |client|
		client.vm.box = "bento/ubuntu-22.04" if is_arm
		client.vm.box = "ubuntu/focal64" if !is_arm
		client.vm.box_architecture = "arm64" if is_arm
		client.vm.hostname = "frontend"
		#client.vm.network "forwarded_port", guest: 22, host: "2232"
		client.vm.network "private_network", ip: "10.20.30.1",netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
		# Expoe o gateway (VM1) para a maquina fisica, pra o app mobile (Expo)
		# conseguir alcancar a API durante o desenvolvimento/teste.
		client.vm.network "forwarded_port", guest: 3000, host: 3000
		client.vm.provider "virtualbox" do |vb|
			#vb.customize ["modifyvm", :id, "--appendconfig", "nopti nospectre_v2 nospectre_v1 irqpoll"] if !is_arm
			#vb.customize ["storagectl", :id, "--name", "SATA Controller", "--hostiocache", "on"] if !is_arm
			#vb.customize ["modifyvm", :id, "--ioapic", "on"] if !is_arm
			#vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"] if !is_arm
			vb.gui = !is_arm
			vb.memory = "1024"
			vb.cpus = 1
			vb.name = "frontend"
			end
		client.vm.provision "shell", inline: <<-SHELL
			sudo apt-get -y update
			sudo apt-get -y install net-tools

			# Forward de ip
			echo "net.ipv4.ip_forward=1" | sudo tee /etc/sysctl.d/99-router.conf
			sudo sysctl -p /etc/sysctl.d/99-router.conf

			# Regras para o forward de ip e habilitação de persistência das regras.
			# O nome da interface de saída (NAT) varia conforme a imagem da box
			# (enpXsY em algumas, eth0 em outras) — descobre em vez de fixar.
			WAN_IF=$(ip route | awk '/^default/ {print $5; exit}')
			sudo iptables -t nat -A POSTROUTING -s 10.20.30.0/24 -o "$WAN_IF" -j MASQUERADE
			echo iptables-persistent iptables-persistent/autosave_v4 boolean true | sudo debconf-set-selections
            echo iptables-persistent iptables-persistent/autosave_v6 boolean true | sudo debconf-set-selections
            sudo DEBIAN_FRONTEND=noninteractive apt-get -y install iptables-persistent

			# Node.js (usado pelo gateway)
			sudo apt-get -y install curl
			curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
			sudo apt-get -y install nodejs
			node -v && npm -v

			# Instala as dependências do gateway a partir da pasta sincronizada
			cd /vagrant/frontend-gateway && npm install

			# Garante que existe um .env 
			[ -f /vagrant/frontend-gateway/.env ] || cp /vagrant/frontend-gateway/.env.example /vagrant/frontend-gateway/.env

			# Sobe o gateway como serviço, pra já ficar rodando após o "vagrant up"
			sudo cp /vagrant/infra/systemd/frontend-gateway.service /etc/systemd/system/frontend-gateway.service
			sudo systemctl daemon-reload
			sudo systemctl enable frontend-gateway
			sudo systemctl restart frontend-gateway
		SHELL
	end
	
	# VM 2 - APP Server / Backend
	config.vm.define "backend" do |backend|
		backend.vm.box = "bento/ubuntu-22.04" if is_arm
		backend.vm.box = "ubuntu/focal64" if !is_arm
		backend.vm.box_architecture = "arm64" if is_arm
		backend.vm.hostname = "backend"

		backend.vm.network "private_network", ip: "10.20.30.2", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
		
		backend.vm.provider "virtualbox" do |vb|
			#vb.customize ["modifyvm", :id, "--appendconfig", "nopti nospectre_v2 nospectre_v1 irqpoll"] if !is_arm
			#vb.customize ["storagectl", :id, "--name", "SATA Controller", "--hostiocache", "on"] if !is_arm
			#vb.customize ["modifyvm", :id, "--ioapic", "on"] if !is_arm
			#vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"] if !is_arm
			vb.gui = !is_arm
			vb.memory = "1024"
			vb.cpus = 1
			vb.name = "backend"
		end

		backend.vm.provision "shell", inline: <<-SHELL
			sudo apt-get -y update
			
			# Ferramentas de rede
			sudo apt-get -y install net-tools
			sudo apt-get -y install telnet
			sudo apt-get -y install curl
			
			# Remove qualquer nodejs/npm antigo do apt do Ubuntu antes de trocar
			# pela fonte NodeSource — o pacote "npm" do Ubuntu prende o nodejs
			# numa versao antiga via dependencia, e os dois lados coexistindo
			# deixa a instalacao pela metade (nodejs velho, sem npm nenhum).
			sudo apt-get -y remove nodejs npm 2>/dev/null || true
			sudo apt-get -y autoremove 2>/dev/null || true

			# Node.js para a API — mesma fonte usada na VM frontend, pra garantir
			# uma versao atual (o pacote "nodejs" do apt do Ubuntu 22.04 e uma
			# versao antiga demais, incompativel com dependencias como o mysql2).
			curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
			sudo apt-get -y install nodejs
			node -v && npm -v
			
			# Cliente MySQL para comunicação/testes com o banco
			sudo apt-get -y install mysql-client

			# Instala as dependências do app-server a partir da pasta sincronizada
			cd /vagrant/app-server && npm install

			# Sobe a API como serviço, pra já ficar rodando após o "vagrant up"
			sudo cp /vagrant/infra/systemd/appserver.service /etc/systemd/system/appserver.service
			sudo systemctl daemon-reload
			sudo systemctl enable appserver
			sudo systemctl restart appserver

			# Setando única conexão de internet através do frontend
			sudo ip route del default via 10.0.2.2 || true
            sudo ip route add default via 10.20.30.1
            sudo rm -f /etc/resolv.conf
            echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
		SHELL
	end
	
	# VM 3 - Banco de Dados (MySQL)
	config.vm.define "db" do |db|
		db.vm.box = "bento/ubuntu-22.04" if is_arm
		db.vm.box = "ubuntu/focal64" if !is_arm
		db.vm.box_architecture = "arm64" if is_arm
		db.vm.hostname = "db"

		db.vm.network "private_network", ip: "10.20.30.3", netmask: "255.255.255.0", virtualbox__intnet: "intnet1"

		db.vm.provider "virtualbox" do |vb|
			#vb.customize ["modifyvm", :id, "--appendconfig", "nopti nospectre_v2 nospectre_v1 irqpoll"] if !is_arm
			#vb.customize ["storagectl", :id, "--name", "SATA Controller", "--hostiocache", "on"] if !is_arm
			#vb.customize ["modifyvm", :id, "--ioapic", "on"] if !is_arm
			#vb.customize ["modifyvm", :id, "--paravirt-provider", "hyperv"] if !is_arm
			vb.gui = !is_arm
			vb.memory = "1024"
			vb.cpus = 1
			vb.name = "db"
		end

		db.vm.provision "shell", inline: <<-SHELL
			sudo apt-get -y update
			sudo apt-get -y install net-tools
			sudo apt-get -y install telnet

			sudo apt-get -y install mysql-server

			# Permite conexões vindas da rede interna (não só localhost)
			sudo sed -i "s/^bind-address.*/bind-address = 10.20.30.3/" /etc/mysql/mysql.conf.d/mysqld.cnf
			sudo systemctl restart mysql

			# Cria banco, usuário de aplicação 
			sudo mysql -e "CREATE DATABASE IF NOT EXISTS crossfit_tracker;"
			sudo mysql -e "CREATE USER IF NOT EXISTS 'crossfit_app' IDENTIFIED BY 'password';"
			sudo mysql -e "GRANT ALL PRIVILEGES ON crossfit_tracker.* TO 'crossfit_app';"
			sudo mysql -e "FLUSH PRIVILEGES;" #Alterações feitas por fora, e.g. scripts, tem efeito no banco de dados

			# Criação tabelas de dados
			sudo mysql crossfit_tracker < /vagrant/database/schema.sql

			# Setando única conexão de internet através do frontend
			sudo ip route del default via 10.0.2.2 || true
            sudo ip route add default via 10.20.30.1
            sudo rm -f /etc/resolv.conf
            echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
		SHELL
	end
end
