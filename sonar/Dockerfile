FROM maven:3.9.9-eclipse-temurin-21

ARG SONAR_SCANNER_VERSION=6.2.1.4610
ARG NODE_VERSION=22

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl unzip \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSLo /tmp/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-x64.zip \
    && unzip /tmp/sonar-scanner.zip -d /opt \
    && mv /opt/sonar-scanner-*/ /opt/sonar-scanner \
    && ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner \
    && rm -f /tmp/sonar-scanner.zip

WORKDIR /workspace

COPY . .

CMD ["sh", "-c", "\
  until curl -fsS http://sonarqube:9000/api/system/status | grep -q UP; do \
    echo 'Aguardando SonarQube...'; sleep 5; \
  done && \
  echo '>>> Gerando cobertura do backend...' && \
  cd api && mvn test && cd /workspace && \
  echo '>>> Gerando cobertura do frontend...' && \
  cd receitasapi-ui && npm ci && npm run test:coverage && \
  NODE_PATH=/workspace/receitasapi-ui/node_modules node /workspace/sonar/generate-lcov.js && cd /workspace && \
  echo '>>> Rodando SonarQube scanner...' && \
  sonar-scanner \
    -Dproject.settings=sonar-project.properties \
    -Dsonar.host.url=http://sonarqube:9000 \
    -Dsonar.login=admin \
    -Dsonar.password=admin \
"]