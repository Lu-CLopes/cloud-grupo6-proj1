Vagrant.configure("2") do |config|
	is_arm = RUBY_PLATFORM.include?("arm64") || RUBY_PLATFORM.include?("aarch64")
	config.vm.define "frontend" do |client|
		client.vm.box = "bento/ubuntu-22.04" if is_arm
		client.vm.box = "ubuntu/focal64" if !is_arm
		client.vm.box_architecture = "arm64" if is_arm
		client.vm.hostname = "frontend"
		#client.vm.network "forwarded_port", guest: 22, host: "2232"
		client.vm.network "private_network", ip: "10.20.30.1",netmask: "255.255.255.0", virtualbox__intnet: "intnet1"
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

			echo "net.ipv4.ip_forward=1" | sudo tee /etc/sysctl.d/99-router.conf
			sudo sysctl -p /etc/sysctl.d/99-router.conf

			sudo iptables -t nat -A POSTROUTING -s 10.20.30.0/24 -o enp0s3 -j MASQUERADE
			echo iptables-persistent iptables-persistent/autosave_v4 boolean true | sudo debconf-set-selections
            echo iptables-persistent iptables-persistent/autosave_v6 boolean true | sudo debconf-set-selections
            sudo DEBIAN_FRONTEND=noninteractive apt-get -y install iptables-persistent
		SHELL
	end
	
	# VM 2 - APP Server / Backend
	config.vm.define "backend" do |backend|
		backend.vm.box = "bento/ubuntu-22.04" if is_arm
		backend.vm.box = "ubuntu/focal64" if !is_arm
		backend.vm.box_architecture = "arm64" if is_arm
		backend.vm.hostname = "backend"

		backend.vm.network "private_network", ip: "10.0.1.2", netmask: "255.255.255.0", virtualbox__intnet: "intnet_interna"

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
			
			# Node.js e npm para a API
			sudo apt-get -y install nodejs
			sudo apt-get -y install npm
			
			# Cliente MySQL para comunicação/testes com o banco
			sudo apt-get -y install mysql-client
		SHELL
	end
	
	# VM 3 - Banco de Dados (MySQL)

	config.vm.define "db" do |db|
		db.vm.box = "bento/ubuntu-22.04" if is_arm
		db.vm.box = "ubuntu/focal64" if !is_arm
		db.vm.box_architecture = "arm64" if is_arm
		db.vm.hostname = "db"

		db.vm.network "private_network", ip: "10.0.1.3", netmask: "255.255.255.0", virtualbox__intnet: "intnet_interna"

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
			sudo sed -i "s/^bind-address.*/bind-address = 10.0.1.3/" /etc/mysql/mysql.conf.d/mysqld.cnf
			sudo systemctl restart mysql

			# Cria banco, usuário de aplicação e schema inicial
			sudo mysql -e "CREATE DATABASE IF NOT EXISTS crossfit_tracker;"
			sudo mysql -e "CREATE USER IF NOT EXISTS 'crossfit_app' IDENTIFIED BY 'password';"
			sudo mysql -e "GRANT ALL PRIVILEGES ON crossfit_tracker.* TO 'crossfit_app';"
			sudo mysql -e "FLUSH PRIVILEGES;" #Alterações feitas por fora, i.g. scripts, tem efeito no banco de dados

			sudo mysql crossfit_tracker -e "
				CREATE TABLE IF NOT EXISTS users (
					id INT AUTO_INCREMENT PRIMARY KEY,
					name VARCHAR(100) NOT NULL,
					email VARCHAR(150) NOT NULL UNIQUE,
					password_hash VARCHAR(255) NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);

				CREATE TABLE IF NOT EXISTS wods (
					id INT AUTO_INCREMENT PRIMARY KEY,
					user_id INT NOT NULL,
					name VARCHAR(150) NOT NULL,
					date DATE NOT NULL,
					notes TEXT,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES users(id)
				);

				CREATE TABLE IF NOT EXISTS exercise_entries (
					id INT AUTO_INCREMENT PRIMARY KEY,
					wod_id INT NOT NULL,
					exercise_name VARCHAR(100) NOT NULL,
					weight DECIMAL(6,2),
					reps INT,
					sets INT,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (wod_id) REFERENCES wods(id)
				);

				CREATE TABLE IF NOT EXISTS personal_records (
					id INT AUTO_INCREMENT PRIMARY KEY,
					user_id INT NOT NULL,
					exercise_name VARCHAR(100) NOT NULL,
					best_weight DECIMAL(6,2) NOT NULL,
					achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (user_id) REFERENCES users(id)
				);
			"
		SHELL
	end
end
