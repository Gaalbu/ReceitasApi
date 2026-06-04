package com.receitasapi.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.receitasapi.api.model.SystemReview;

public interface SystemReviewRepository extends JpaRepository<SystemReview, Long> {
	List<SystemReview> findAllByOrderByIdDesc();

	void deleteByUserUsername(String username);
}

