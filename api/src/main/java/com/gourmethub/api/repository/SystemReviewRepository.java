package com.gourmethub.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gourmethub.api.model.SystemReview;

public interface SystemReviewRepository extends JpaRepository<SystemReview, Long> {
	void deleteByUserUsername(String username);
}

