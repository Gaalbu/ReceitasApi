FROM maven:3.9.9-eclipse-temurin-21

ARG SONAR_SCANNER_VERSION=6.2.1.4610

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl unzip nodejs npm \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSLo /tmp/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-x64.zip \
    && unzip /tmp/sonar-scanner.zip -d /opt \
    && mv /opt/sonar-scanner-*/ /opt/sonar-scanner \
    && ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner \
    && rm -f /tmp/sonar-scanner.zip

WORKDIR /workspace

COPY . .

CMD ["sh", "-c", "until curl -fsS http://sonarqube:9000/api/system/status | grep -q UP; do echo 'Aguardando SonarQube...'; sleep 5; done && cd api && mvn test && cd /workspace/receitasapi-ui && npm ci && npm run test:coverage && cd /workspace && sonar-scanner -Dproject.settings=sonar-project.properties -Dsonar.host.url=http://sonarqube:9000 -Dsonar.login=admin -Dsonar.password=admin"]